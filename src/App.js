import React, { useEffect, useState } from 'react'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { get, isString } from 'lodash'

import EthereumGraph from './Graph/EthereumGraph'
import Classification from './DataAnalyse/Classification'
import CustomAppBar from './CustomAppBar'
import LeftPanel from './LeftPanel/LeftPanel'
import { makeStyles } from '@material-ui/core/styles'
import ClassificationTest from './AddressTest/ClassificationTest'
import SearchNeighbors from './SearchNeighbors/SearchNeighbors'
import Info from './Info/Info'
import Logs from './Logs/Logs'
import SnackbarMessage from './components/SnackbarMessage'
import Settings from './Settings/Settings'
/*
function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://material-ui.com/">
                Tarix Website
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}
*/

export const ModelContext = React.createContext({
  model: {
    lg: null,
    rf: null,
    knn: null,
    newModelsJSON: null,
  },
  setModels: () => {},
})

export const ConfMatrix = React.createContext({
  confusionMatrix: {
    rf: null,
    lg: null,
    knn: null,
    nb: null,
  },
  setConfMatrix: () => {},
})

export const StepContext = React.createContext({
  step: 0,
  setStep: () => {},
})

export const SnackbarContext = React.createContext({
  snackbarMessage: { type: null, message: null },
  setSnackbarMessage: () => {},
})

export const ScamNeighborContext = React.createContext({
  neighborsScamFounded: { edges: null, nodes: null },
  setNeighborsScamFounded: () => {},
})

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
}))

const getMessageType = mesg => {
  const message = get(mesg, 'messageNotify.message', '')
  if (isString(message) && message.toLowerCase().indexOf('error') > -1) {
    return 'error'
  }
  if (isString(message) && message.toLowerCase().indexOf('warning') > -1) {
    return 'warning'
  }
  if (isString(message) && message.toLowerCase().indexOf('info') > -1) {
    return 'info'
  }
  return 'success'
}

const MESSAGE = gql`
  subscription Message {
    messageNotify {
      message
    }
  }
`

const SCAM_FOUND = gql`
  subscription MySubscription {
    neighborsScamFounded {
      edges {
        from
        to
      }
      error
      nodes {
        group
        id
        label
        shape
      }
    }
  }
`

const App = () => {
  const classes = useStyles()
  const [step, setStep] = useState(0)
  const [open, setOpen] = useState(true)
  const [models, setModels] = useState({
    lg: null,
    rf: null,
    knn: null,
    newModelsJSON: null,
  })
  const [confusionMatrix, setConfMatrix] = useState({
    rf: null,
    lg: null,
    knn: null,
    nb: null,
  })
  const [snackbarMessage, setSnackbarMessage] = useState({
    type: null,
    message: null,
  })
  const [neighborsScamFounded, setNeighborsScamFounded] = useState({
    edges: null,
    nodes: null,
  })

  const { data: message } = useSubscription(MESSAGE)
  const { data: scamNeighbors } = useSubscription(SCAM_FOUND)
  useEffect(() => {
    setSnackbarMessage({
      type: getMessageType(message),
      message: get(message, 'messageNotify.message'),
    })
  }, [message])
  useEffect(() => {
    setNeighborsScamFounded(get(scamNeighbors, 'neighborsScamFounded'))
  }, [scamNeighbors])

  // todo in state of setMOdels write hook to store to local storage and to state
  const handleDrawerOpen = () => {
    setOpen(true)
  }
  const handleDrawerClose = () => {
    setOpen(false)
  }
  return (
    <ModelContext.Provider value={{ models, setModels }}>
      <ConfMatrix.Provider value={{ confusionMatrix, setConfMatrix }}>
        <StepContext.Provider value={{ step, setStep }}>
          <SnackbarContext.Provider
            value={{ snackbarMessage, setSnackbarMessage }}
          >
            <ScamNeighborContext.Provider
              value={{ neighborsScamFounded, setNeighborsScamFounded }}
            >
              <BrowserRouter>
                <div className={classes.root}>
                  <CustomAppBar
                    open={open}
                    handleDrawerOpen={handleDrawerOpen}
                  />
                  <LeftPanel
                    open={open}
                    handleDrawerClose={handleDrawerClose}
                  />
                  <Switch>
                    <Redirect exact from="/" to="/graph" />
                    <Route path="/class">
                      <Classification />
                    </Route>
                    <Route path="/model">
                      <ClassificationTest />
                    </Route>
                    <Route path="/searchneighbors">
                      <SearchNeighbors />
                    </Route>
                    <Route path="/info">
                      <Info />
                    </Route>
                    <Route path="/logs">
                      <Logs />
                    </Route>
                    <Route path="/update">
                      <Settings />
                    </Route>
                    <Route path="/graph/:hash">
                      <EthereumGraph />
                    </Route>
                    <Route path="/graph">
                      <EthereumGraph />
                    </Route>
                  </Switch>
                  <SnackbarMessage snackbarMessage={snackbarMessage} />
                </div>
              </BrowserRouter>
            </ScamNeighborContext.Provider>
          </SnackbarContext.Provider>
        </StepContext.Provider>
      </ConfMatrix.Provider>
    </ModelContext.Provider>
  )
}

export default App
// TODO Some data powered by Etherscan.io APIs
// TODO Some data powered by etherscamdb APIs
