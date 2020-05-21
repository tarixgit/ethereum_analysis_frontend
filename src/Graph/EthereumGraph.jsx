import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import { useParams } from 'react-router-dom'
import { useLazyQuery, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Network from './Network'
import { forEach, get, uniqBy, map, mapKeys, mapValues, keyBy } from 'lodash'
import { networkOptions } from './config'

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

const getNodesAndEdges = addressesWithIndo => {
  let edges = []
  let nodes = []
  const mainAddressId = Number(addressesWithIndo.id)
  const {
    id,
    hash,
    alias,
    labelId,
    transactionsInput,
    transactionsOutput,
  } = addressesWithIndo
  nodes = [{ id: Number(id), label: alias || hash, group: labelId }]
  edges = []
  forEach(transactionsInput, ({ fromAddress }) => {
    const { id, hash, alias, labelId } = fromAddress
    nodes.push({ id: Number(id), label: alias || hash, group: labelId })
    edges.push({ from: Number(id), to: mainAddressId })
  })
  forEach(transactionsOutput, ({ toAddress }) => {
    const { id, hash, alias, labelId } = toAddress
    nodes.push({ id: Number(id), label: alias || hash, group: labelId })
    edges.push({ from: mainAddressId, to: Number(id) })
  })
  return { nodes, edges }
}

const EthereumGraph = () => {
  const classes = useStyles()
  const { hash } = useParams()
  let edges = []
  let nodes = []
  let labelsList = []
  const [address, setAddress] = useState(
    hash || '0xee18e156a020f2b2b2dcdec3a9476e61fbde1e48'
  )
  //Labels
  const {
    loading: labelLoading,
    data: labelsData,
    called,
    errorLabels,
  } = useQuery(LABELS)
  const [loadNetworkData, { loading, error, data }] = useLazyQuery(TRANSACTION)
  const [loadMoreNetworkData, { data: dataAdd }] = useLazyQuery(
    TRANSACTION_MORE
  )
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
        variables: { address: address.toLowerCase() },
      })
    },
    [loadNetworkData]
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
  const addressesWithInfo = get(data, 'addresses[0]', null)
  if (addressesWithInfo) {
    const result = getNodesAndEdges(addressesWithInfo)
    edges = result.edges
    nodes = result.nodes
  }
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
  const labelsListKeyed = keyBy(labelsList, 'id')
  const order = [0, 3, 6, 1, 5, 2, 7, 8, 4, 9]
  const labels = map(order, id => (
    <div className={classes.labelItem}>
      <div className={classes[`circle${labelsListKeyed[id].id}`]} />
      {labelsListKeyed[id].name}
    </div>
  ))

  return (
    <Fragment>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="xl" className={classes.container}>
          <Grid container spacing={2} style={{ height: '100%' }}>
            <Grid item xs={12}>
              <Paper>
                <form onSubmit={submit}>
                  <TextField
                    id="address-input"
                    label="Address"
                    autoFocus
                    fullWidth
                    value={address}
                    onChange={changeAddress}
                  />
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

export default EthereumGraph
