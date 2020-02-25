import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import { map, get, truncate } from 'lodash'
import Button from '@material-ui/core/Button'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import TextField from '@material-ui/core/TextField'

const LOAD_ADDRESS_FEATURES = gql`
  query AddressFeatures($offset: Int!, $limit: Int!) {
    addressFeatures(offset: $offset, limit: $limit) {
      rows {
        id
        hash
        scam
        numberOfNone
        numberOfOneTime
        numberOfExchange
        numberOfMiningPool
        numberOfMiner
        numberOfSmContract
        numberOfERC20
        numberOfERC721
        numberOfTrace
        numberOfTransaction
        medianOfEthProTrans
        averageOfEthProTrans
      }
      count
    }
  }
`
const useStyles = makeStyles(theme => ({
  root: {
    // width: '100%',
    paddingTop: '19px',
    paddingLeft: '19px',
    paddingRight: '19px',
    margin: '10px',
  },
  button: {
    padding: 0,
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}))

const ClassificationModel = ({ buildFeatures }) => {
  const classes = useStyles()
  const [address, setAddress] = useState(
    '0xee18e156a020f2b2b2dcdec3a9476e61fbde1e48'
  )
  const { data, loading } = useQuery(LOAD_ADDRESS_FEATURES, {
    variables: { offset: 0, limit: 10000 },
  })
  const rows = get(data, 'addressFeatures.rows', [])
  //const count = get(data, 'addressFeatures.count', -1)
  const changeAddress = e => {
    const { value } = e.target
    setAddress(value)
  }

  const checkAddress = useCallback(() => {
    // run test
  })
  return (
    <Paper elevation={3} className={classes.root}>
      <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
        <Button variant="contained" color="primary" onClick={buildFeatures}>
          Train
        </Button>
      </div>
      <Paper elevation={0} className={classes.paper}>
        <div>Output:</div>
        <div>{}</div>
        <div>
          <form onSubmit={checkAddress}>
            <TextField
              id="address-input"
              label="Address"
              autoFocus
              fullWidth
              value={address}
              onChange={changeAddress}
            />
          </form>
          <Button variant="contained" color="primary" onClick={checkAddress}>
            Check Address
          </Button>
        </div>
        <div>Output:</div>
        <div>{}</div>
      </Paper>
    </Paper>
  )
}

export default ClassificationModel
