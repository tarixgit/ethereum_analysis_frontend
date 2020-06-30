import React, { useContext, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Button from '@material-ui/core/Button'

import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'

import { SnackbarContext } from '../App'

import { get } from 'lodash'

const BUILD_FEATURES = gql`
  mutation UpdateDataFromBlockchain {
    updateDataFromBlockchain {
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

  const [buildFeatures, { loading }] = useMutation(BUILD_FEATURES, {
    cachePolicy: 'no-cache',
    ignoreResults: true,
    onCompleted: data => {
      const importDataResponse = get(data, 'buildFeaturesThread', {
        success: null,
        message: null,
      })
      if (!importDataResponse.message) {
        return
      }
      setSnackbarMessage(importDataResponse)
    },
  })

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Container maxWidth="xl" className={classes.container}>
        <Button variant="contained" color="primary" onClick={buildFeatures}>
          Update database from blockchain
        </Button>
      </Container>
    </main>
  )
}

export default Settings
