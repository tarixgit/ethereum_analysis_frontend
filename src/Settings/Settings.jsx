import React, { useContext, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Button from '@material-ui/core/Button'

import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'

import { SnackbarContext } from '../App'

import { get } from 'lodash'

const IMPORT_FROM_BLOCKCHAIN = gql`
  mutation UpdateDataFromBlockchain {
    updateDataFromBlockchain {
      success
      message
    }
  }
`
const IMPORT_LABEL = gql`
  mutation ImportLabels($type: Int!) {
    updateLabelFromEther(type: $type) {
      success
      message
    }
  }
`

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  stepperHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
    // overflowY: 'visible', // scroll to visible for tests
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  container: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  nextButton: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },
}))

const Settings = (callback, deps) => {
  const classes = useStyles()
  const { setSnackbarMessage } = useContext(SnackbarContext)

  const [buildFeatures, { loading }] = useMutation(IMPORT_FROM_BLOCKCHAIN, {
    cachePolicy: 'no-cache',
    ignoreResults: true,
    onCompleted: data => {
      const response = get(data, 'updateDataFromBlockchain', {
        success: null,
        message: null,
      })
      if (!response.message) {
        return
      }
      setSnackbarMessage(response)
    },
  })
  const [importLabel] = useMutation(IMPORT_LABEL, {
    cachePolicy: 'no-cache',
    ignoreResults: true,
    onCompleted: data => {
      const response = get(data, 'updateLabelFromEther', {
        success: null,
        message: null,
      })
      if (!response.message) {
        return
      }
      setSnackbarMessage(response)
    },
  })
  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Container maxWidth="xl" className={classes.container}>
        <Button variant="contained" color="primary" onClick={buildFeatures}>
          Update database from blockchain
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => importLabel({ variables: { type: 7 } })}
        >
          Import ERC20 addresses
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => importLabel({ variables: { type: 8 } })}
        >
          Import ERC721 addresses
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => importLabel({ variables: { type: 6 } })}
        >
          Import Exchanges
        </Button>
        <Button variant="contained" color="primary" onClick={() => null}>
          Update Labels
        </Button>
      </Container>
    </main>
  )
}

export default Settings
