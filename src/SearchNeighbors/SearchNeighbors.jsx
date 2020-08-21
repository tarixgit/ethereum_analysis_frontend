import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import { useLazyQuery, useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Network from '../Graph/Network'
import {
  find,
  get,
  uniqBy,
  map,
  mapKeys,
  mapValues,
  keyBy,
  countBy,
  differenceBy,
} from 'lodash'
import { networkOptions } from '../Graph/config'
import { SnackbarContext, ScamNeighborContext } from '../App'
import { getNodesAndEdges } from '../Graph/EthereumGraph'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import InputAdornment from '@material-ui/core/InputAdornment'
import { CircularProgress } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  networkContainer: {
    height: `calc(100% - ${2 * theme.mixins.toolbar.minHeight}px)`, //  162px  - pading -
    // height: 'calc(100% - 162px)',
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'visible', // scroll to visible for tests
  },
  container: {
    height: `calc(100% - ${theme.mixins.toolbar.minHeight}px - ${theme.spacing(
      1
    )}px)`,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  labelWrapper: {
    display: 'flex',
  },
  labelItem: {
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  ...mapValues(
    mapKeys(networkOptions.groups, (val, key) => `circle${key}`),
    ({ color: { border, background } }) => ({
      borderRadius: '50%',
      borderWidth: '1px',
      borderStyle: 'solid',
      height: '25px',
      width: '25px',
      marginRight: '2px',
      border,
      background,
    })
  ),
  circleAll: {
    borderRadius: '50%',
    borderWidth: '1px',
    borderStyle: 'solid',
    height: '25px',
    width: '25px',
    marginRight: '2px',
    border: '#2B7CE9',
    background: '#ffffff',
  },
}))

const LABELS = gql`
  query Labels {
    labels {
      id
      name
      color
    }
  }
`

const TEST = gql`
  mutation FindNeighborsScam($address: String!, $level: Int, $direction: Int) {
    findNeighborsScamThread(
      address: $address
      level: $level
      direction: $direction
    ) {
      success
      message
    }
  }
`

const TRANSACTION_MORE = gql`
  query Address($addressId: ID!) {
    address(id: $addressId) {
      id
      scam
      hash
      degree
      alias
      labelId
      transactionsInput {
        amount
        bid
        id
        fromAddress {
          id
          hash
          scam
          labelId
          degree
          outdegree
          alias
        }
      }
      transactionsOutput {
        amount
        bid
        id
        toAddress {
          id
          hash
          scam
          labelId
          degree
          outdegree
          alias
        }
      }
    }
  }
`

const SearchNeighbors = () => {
  const classes = useStyles()
  let labelsList = []
  const { setSnackbarMessage } = useContext(SnackbarContext)
  const { neighborsScamFounded } = useContext(ScamNeighborContext)
  const [direction, setDirection] = useState(0)
  let edgesC = get(neighborsScamFounded, 'edges') || []
  let nodesC = get(neighborsScamFounded, 'nodes') || []
  const startNode = find(nodesC, { main: true })
  const [edges, setEdges] = useState(edgesC)
  const [nodes, setNodes] = useState(uniqBy(nodesC, 'id'))
  const [address, setAddress] = useState(get(startNode, 'label', ' '))

  const [level, setLevel] = useState(3)

  //Labels
  const {
    loading: labelLoading,
    data: labelsData,
    called,
    networkStatus,
    errorLabels,
  } = useQuery(LABELS)
  const [loadNetworkData, { loading, error }] = useMutation(TEST, {
    onCompleted: data => {
      const dataMessage = get(data, 'findNeighborsScamThread', {
        success: null,
        message: null,
      })
      if (!dataMessage.message) {
        return
      }
      setSnackbarMessage({
        ...dataMessage,
        type: dataMessage.success ? 'success' : null,
      })
    },
  })
  const [
    loadMoreNetworkData,
    {
      data: dataAdd,
      loading: loadingTransMore,
      networkStatus: networkStatusLazy,
    },
  ] = useLazyQuery(TRANSACTION_MORE)

  const changeLevel = useCallback(
    e => {
      const { value } = e.target
      setLevel(value)
    },
    [setLevel]
  )

  const changeAddress = useCallback(
    e => {
      const { value } = e.target
      setAddress(value)
    },
    [loadNetworkData, setAddress]
  )
  const submit = useCallback(
    e => {
      e.preventDefault()
      loadNetworkData({
        variables: {
          address: address.toLowerCase().trim(),
          level: Number(level),
          direction: Number(direction),
        },
      })
    },
    [loadNetworkData, address, level, direction]
  )
  const loadMore = useCallback(
    addressId => {
      if (!addressId) return
      loadMoreNetworkData({
        variables: { addressId: addressId },
      })
    },
    [loadMoreNetworkData]
  )
  useEffect(() => {
    let edges = get(neighborsScamFounded, 'edges') || []
    let nodes = get(neighborsScamFounded, 'nodes') || []
    const startNode = find(nodes, { main: true })
    setAddress(get(startNode, 'label'))
    setEdges(edges)
    setNodes(uniqBy(nodes, 'id'))
  }, [neighborsScamFounded])

  // nachladen
  const addressAdditional = get(dataAdd, 'address', null)
  useEffect(() => {
    let news = []
    if (networkStatusLazy === 7) {
      const result = getNodesAndEdges(addressAdditional)
      news = differenceBy(result.nodes, nodes, 'id')
      setEdges([...edges, ...result.edges])
      setNodes(uniqBy([...nodes, ...result.nodes], 'id'))
    }
    if (!news.length && !loadingTransMore && addressAdditional) {
      setSnackbarMessage({
        type: 'warning',
        message: 'No new nodes',
      })
    }
  }, [addressAdditional])
  if (labelLoading) return <p>labelLoading...</p>
  if (errorLabels) return <p>Error :(</p>

  let labels
  if (called && !labelLoading) {
    labelsList = get(labelsData, 'labels', null)
    const nodesCounted = countBy(nodes, 'group')
    const labelsListKeyed = keyBy(labelsList, 'id')
    const order = [0, 3, 6, 1, 5, 2, 7, 8, 4, 9]
    labels = labelsList
      ? map(order, id => (
          <div className={classes.labelItem} key={`ethereumgraph_${id}`}>
            <div className={classes[`circle${labelsListKeyed[id].id}`]} />
            {nodesCounted[id]
              ? `${labelsListKeyed[id].name} (${nodesCounted[id]})`
              : labelsListKeyed[id].name}
          </div>
        ))
      : null
    labels = labels
      ? [
          ...labels,
          <div className={classes.labelItem} key="ethereumgraph_circleAll">
            <div className={classes.circleAll} />
            {nodes.length ? `All (${nodes.length})` : 'All'}
          </div>,
        ]
      : labels

    labels =
      !labels && networkStatus === 8 ? 'Cannot connect to the server.' : labels
  }
  const spinner = loadingTransMore
  return (
    <Fragment>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="xl" className={classes.container}>
          <Grid
            container
            spacing={2}
            style={{ height: '100%', position: 'relative' }}
          >
            <Grid item xs={12}>
              <Paper>
                <form onSubmit={submit}>
                  <Grid
                    container
                    direction="row"
                    justify="center"
                    alignItems="center"
                  >
                    <Grid item xs={9}>
                      <TextField
                        id="address-input"
                        label="Address"
                        style={{ marginLeft: 1 }}
                        fullWidth
                        autoFocus
                        value={address}
                        onChange={changeAddress}
                        InputProps={{
                          startAdornment: spinner ? (
                            <InputAdornment
                              position="start"
                              style={{ marginBottom: 5 }}
                            >
                              <CircularProgress
                                size={15}
                                style={{ color: '#3f88ec' }}
                              />
                            </InputAdornment>
                          ) : (
                            undefined
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <TextField
                        id="address-input"
                        label="Level"
                        fullWidth
                        autoFocus
                        value={level}
                        onChange={changeLevel}
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <FormControl className={classes.formControl} fullWidth>
                        <InputLabel htmlFor="outlined-age-native-simple">
                          Show direction
                        </InputLabel>
                        <Select
                          native
                          fullWidth
                          value={direction}
                          onChange={e => setDirection(e.target.value)}
                          label="Direction"
                          inputProps={{
                            name: 'Direction',
                            id: 'outlined-age-native-simple',
                          }}
                        >
                          <option value={0}>Output trans.</option>
                          <option value={1}>Input trans.</option>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={1}>
                      <Button
                        style={{
                          marginLeft: 4,
                          float: 'right',
                          marginRight: 5,
                        }}
                        variant="contained"
                        color="primary"
                        onClick={submit}
                      >
                        Search
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </Grid>
            <Grid item xs={12} className={classes.labelWrapper}>
              {labels}
            </Grid>
            {error ? <p>Error :(</p> : null}
            {/* loading=> speening wheel*/}
            <Grid item xs={12} className={classes.networkContainer}>
              <Network
                nodes={nodes}
                edges={edges}
                loadMore={loadMore}
                labels={labelsList}
                direction={true}
              />
            </Grid>
          </Grid>
        </Container>
      </main>
    </Fragment>
  )
}

export default SearchNeighbors
