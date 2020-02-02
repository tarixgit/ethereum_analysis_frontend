import React, { useCallback, useState } from 'react'
import { useLazyQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Network from './Network'
import { forEach, get, uniq, uniqBy } from 'lodash'

const TRANSACTION = gql`
  query MyQuery($address: String!) {
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

const EthereumGraph = classes => {
  let edges = []
  let nodes = []
  const [address, setAddress] = useState('')
  const [loadNetworkData, { loading, error, data }] = useLazyQuery(TRANSACTION)
  const changeAddress = useCallback(e => {
    const { value } = e.target
    if (value.length >= 42) {
      loadNetworkData({
        variables: { address: value.toLowerCase() },
      })
    }
    setAddress(value)
  })

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error :(</p>
  const addressesWithIndo = get(data, 'addresses[0]', null)
  if (addressesWithIndo) {
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
  }
  nodes = uniqBy(nodes, 'id')
  return (
    <Grid container spacing={3} style={{ height: '100%' }}>
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <TextField
            id="address-input"
            label="Address"
            autoFocus
            fullWidth
            value={address}
            onChange={changeAddress}
          />
        </Paper>
      </Grid>
      <Grid item xs={12} style={{ height: '100%' }}>
        <Network nodes={nodes} edges={edges} />
      </Grid>
    </Grid>
  )
}

export default EthereumGraph
