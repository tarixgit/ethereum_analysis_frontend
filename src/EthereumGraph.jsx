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
import { forEach, get, uniq, uniqBy, map } from 'lodash'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'visible', // scroll to visible for tests
  },
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
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
      label {
        color
        name
        id
      }
      transactionsInput {
        amount
        bid
        id
        fromAddress {
          id
          hash
          scam
          label {
            color
            name
            id
          }
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
          label {
            color
            name
            id
          }
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
      label {
        color
        name
        id
      }
      transactionsInput {
        amount
        bid
        id
        fromAddress {
          id
          hash
          scam
          label {
            color
            name
            id
          }
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
          label {
            color
            name
            id
          }
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
    label: { id: labelId },
    transactionsInput,
    transactionsOutput,
  } = addressesWithIndo
  nodes = [{ id: Number(id), label: alias || hash, group: labelId }]
  edges = []
  forEach(transactionsInput, ({ fromAddress }) => {
    const {
      id,
      hash,
      alias,
      label: { id: labelId },
    } = fromAddress
    nodes.push({ id: Number(id), label: alias || hash, group: labelId })
    edges.push({ from: Number(id), to: mainAddressId })
  })
  forEach(transactionsOutput, ({ toAddress }) => {
    const {
      id,
      hash,
      alias,
      label: { id: labelId },
    } = toAddress
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
  const [address, setAddress] = useState(
    hash || '0xee18e156a020f2b2b2dcdec3a9476e61fbde1e48'
  )
  //Labels
  const { loading: labelLoading, data: labelsData, called } = useQuery(LABELS)
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
      if (value.length >= 42) {
        loadNetworkData({
          variables: { address: value.toLowerCase() },
        })
      }
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

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error :(</p>
  const addressesWithInfo = get(data, 'addresses[0]', null)
  if (addressesWithInfo) {
    const result = getNodesAndEdges(addressesWithInfo)
    edges = result.edges
    nodes = result.nodes
  }
  const addressWithInfo = get(dataAdd, 'address', null)
  if (addressWithInfo) {
    const result = getNodesAndEdges(addressWithInfo)
    edges = [...edges, ...result.edges]
    nodes = [...nodes, ...result.nodes]
  }

  if (called && !labelLoading) {
    const labels = get(labelsData, 'labels', null)
    // const options = map(labels, {id, color} => {
    //   id:
    // })
  }
  nodes = uniqBy(nodes, 'id')
  // let labels = map(nodes, 'group')
  // labels = uniqBy(nodes, 'group')
  // labels = map(labels, ({ group }) => ({ id: group, label: 'Group' + group }))
  // nodes = [...labels, ...nodes]

  return (
    <Fragment>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container
          maxWidth="xl"
          className={classes.container}
          style={{ height: '100%' }}
        >
          <Grid container spacing={3} style={{ height: '100%' }}>
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
            <Grid item xs={11} style={{ height: '100%' }}>
              <Network nodes={nodes} edges={edges} loadMore={loadMore} />
            </Grid>
            <Grid item xs={1}>
              <div style={{ color: '#97c2fc' }}>Kein Typ</div>
              <div style={{ color: '#ffff00' }}>Exchange</div>
              <div style={{ color: '#fb7e81' }}>Onetime</div>
              <div style={{ color: '#7be141' }}>Miner</div>
            </Grid>
          </Grid>
        </Container>
      </main>
    </Fragment>
  )
}

export default EthereumGraph
