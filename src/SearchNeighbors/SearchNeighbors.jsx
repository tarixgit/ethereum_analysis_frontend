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
} from 'lodash'
import { networkOptions } from '../Graph/config'
import { SnackbarContext, ScamNeighborContext } from '../App'
import { getNodesAndEdges } from '../Graph/EthereumGraph'

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
  mutation FindNeighborsScam($address: String!, $level: Int) {
    findNeighborsScamThread(address: $address, level: $level) {
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
  let edges = get(neighborsScamFounded, 'edges') || []
  let nodes = get(neighborsScamFounded, 'nodes') || []
  const startNodeId = get(edges, '[0].from')
  const startNode = find(nodes, { id: startNodeId })
  const [address, setAddress] = useState(
    get(startNode, 'label') || '0xee18e156a020f2b2b2dcdec3a9476e61fbde1e48'
  )

  const [level, setLevel] = useState(3)

  //Labels
  const {
    loading: labelLoading,
    data: labelsData,
    called,
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
      setSnackbarMessage(dataMessage)
    },
  })
  const [loadMoreNetworkData, { data: dataAdd }] = useLazyQuery(
    TRANSACTION_MORE
  )

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
        variables: { address: address.toLowerCase(), level: Number(level) },
      })
    },
    [loadNetworkData, address, level]
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

  if (labelLoading) return <p>labelLoading...</p>
  if (errorLabels) return <p>Error :(</p>

  // nachladen
  const addressAdditional = get(dataAdd, 'address', null)
  if (addressAdditional) {
    const result = getNodesAndEdges(addressAdditional)
    edges = [...edges, ...result.edges]
    nodes = [...nodes, ...result.nodes]
  }

  if (called && !labelLoading) {
    labelsList = get(labelsData, 'labels', null)
  }
  nodes = uniqBy(nodes, 'id')
  const nodesCounted = countBy(nodes, 'group')
  const labelsListKeyed = keyBy(labelsList, 'id')
  const order = [0, 3, 6, 1, 5, 2, 7, 8, 4, 9]
  const labels = map(order, id => (
    <div className={classes.labelItem} key={`searchneighbors_${id}`}>
      <div className={classes[`circle${labelsListKeyed[id].id}`]} />
      {nodesCounted[id]
        ? `${labelsListKeyed[id].name} (${nodesCounted[id]})`
        : labelsListKeyed[id].name}
    </div>
  ))

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
                    justify="flex-start"
                    alignItems="center"
                  >
                    <Grid item xs={10}>
                      <TextField
                        id="address-input"
                        label="Address"
                        style={{ marginLeft: 1 }}
                        fullWidth
                        autoFocus
                        value={address}
                        onChange={changeAddress}
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
                      <Button
                        style={{ marginLeft: 4 }}
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
              />
            </Grid>
          </Grid>
        </Container>
      </main>
    </Fragment>
  )
}

export default SearchNeighbors
