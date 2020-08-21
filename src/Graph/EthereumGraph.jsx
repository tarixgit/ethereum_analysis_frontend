import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import { useParams } from 'react-router-dom'
import { useLazyQuery, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import memoizeOne from 'memoize-one'
import {
  countBy,
  forEach,
  get,
  uniqBy,
  map,
  mapKeys,
  mapValues,
  keyBy,
  differenceBy,
} from 'lodash'
import { networkOptions } from './config'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import { CircularProgress } from '@material-ui/core'
import InputAdornment from '@material-ui/core/InputAdornment'
import { SnackbarContext } from '../App'
import Network from './Network'

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

const TRANSACTION = gql`
  query Addresses($address: String!) {
    addresses(address: $address) {
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

const getNodeEdgeFromTrans = (
  { id, hash, alias, labelId, scam },
  mainAddressId,
  isInputTrans,
  amount
) => ({
  // scam flag updated manually in addersses
  node: scam
    ? { id: Number(id), label: alias || hash, group: labelId, shape: 'star' }
    : { id: Number(id), label: alias || hash, group: labelId },
  edge: isInputTrans
    ? { from: Number(id), to: mainAddressId, value: amount }
    : { from: mainAddressId, to: Number(id), value: amount },
})
export const getNodesAndEdges = memoizeOne(addressesWithInfo => {
  let edges = []
  let nodes = []
  if (!addressesWithInfo) {
    return { nodes, edges }
  }
  const mainAddressId = Number(addressesWithInfo.id)
  const {
    id,
    hash,
    alias,
    labelId,
    scam,
    transactionsInput,
    transactionsOutput,
  } = addressesWithInfo
  nodes = [
    scam
      ? { id: Number(id), label: alias || hash, group: labelId, shape: 'star' }
      : { id: Number(id), label: alias || hash, group: labelId },
  ]
  edges = []
  forEach(transactionsInput, ({ fromAddress, amount }) => {
    const { node, edge } = getNodeEdgeFromTrans(
      fromAddress,
      mainAddressId,
      true,
      amount
    )
    nodes.push(node)
    edges.push(edge)
  })
  forEach(transactionsOutput, ({ toAddress, amount }) => {
    const { node, edge } = getNodeEdgeFromTrans(
      toAddress,
      mainAddressId,
      false,
      amount
    )
    nodes.push(node)
    edges.push(edge)
  })
  return { nodes, edges }
})

const EthereumGraph = () => {
  const classes = useStyles()
  const { hash } = useParams()
  const [edges, setEdges] = useState([])
  const [nodes, setNodes] = useState([])
  let labelsList = []
  const { setSnackbarMessage } = useContext(SnackbarContext)
  const [address, setAddress] = useState(
    hash || '0xee18e156a020f2b2b2dcdec3a9476e61fbde1e48'
  )
  const [direction, setDirection] = useState(0)
  //Labels
  const {
    loading: labelLoading,
    data: labelsData,
    called,
    errorLabels,
    networkStatus,
  } = useQuery(LABELS)
  const [
    loadNetworkData,
    { error, data, loading: loadingTrans },
  ] = useLazyQuery(TRANSACTION)
  const [
    loadMoreNetworkData,
    {
      data: dataAdd,
      loading: loadingTransMore,
      networkStatus: networkStatusLazy,
    },
  ] = useLazyQuery(TRANSACTION_MORE)
  useEffect(() => {
    if (hash) {
      loadNetworkData({
        variables: { address: hash.toLowerCase() },
      })
    }
  }, [hash, loadNetworkData])

  const changeAddress = useCallback(
    e => {
      const { value } = e.target
      //cause performance issue
      // if (value.length >= 42) {
      //   loadNetworkData({
      //     variables: { address: value.toLowerCase() },
      //   })
      // }
      setAddress(value)
    },
    [loadNetworkData, setAddress]
  )
  const submit = useCallback(
    e => {
      e.preventDefault()
      loadNetworkData({
        variables: { address: address.toLowerCase().trim() },
      })
    },
    [loadNetworkData, address]
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
  const addressesWithInfo = get(data, 'addresses[0]', null)
  useEffect(() => {
    if (addressesWithInfo) {
      const result = getNodesAndEdges(addressesWithInfo)
      setEdges(result.edges)
      setNodes(uniqBy(result.nodes, 'id'))
    }
  }, [addressesWithInfo])

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
  const spinner = loadingTransMore || loadingTrans
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
              <form onSubmit={submit}>
                <Grid
                  container
                  direction="row"
                  justify="flex-start"
                  alignItems="center"
                  spacing={1}
                >
                  <Grid item xs={11}>
                    <TextField
                      id="address-input"
                      label="Address"
                      style={{ marginLeft: 1, paddingRight: 1 }}
                      autoFocus
                      fullWidth
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
                    {/*<CircularProgress size={15} color="primary" />*/}
                  </Grid>
                  <Grid item xs={1}>
                    <FormControl className={classes.formControl}>
                      <InputLabel htmlFor="outlined-age-native-simple">
                        Show direction
                      </InputLabel>
                      <Select
                        native
                        value={direction}
                        onChange={e => setDirection(e.target.value)}
                        label="Show direction"
                        inputProps={{
                          name: 'Direction',
                          id: 'outlined-age-native-simple',
                        }}
                      >
                        <option value={0}>No direction</option>
                        <option value={1}>Direction</option>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </form>
            </Grid>
            <Grid item xs={12} className={classes.labelWrapper}>
              {labels}
            </Grid>
            {error ? <p>Error :(</p> : null}
            <Grid item xs={12} className={classes.networkContainer}>
              <Network
                nodes={nodes}
                edges={edges}
                loadMore={loadMore}
                labels={labelsList}
                direction={direction}
              />
            </Grid>
          </Grid>
        </Container>
      </main>
    </Fragment>
  )
}

export default EthereumGraph
