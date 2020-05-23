import React, { useEffect, useState } from 'react'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { get } from 'lodash'

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
  setModel: () => {},
})

export const StepContext = React.createContext({
  step: 0,
  setStep: () => {},
})

export const SnackbarContext = React.createContext({
  snackbarMessage: { success: null, message: null },
  setSnackbarMessage: () => {},
})

export const ScamNeighborContext = React.createContext({
  neighborsScamFounded: null,
  setNeighborsScamFounded: () => {},
})

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
}))

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
  const [snackbarMessage, setSnackbarMessage] = useState({
    success: null,
    message: null,
  })
  const [neighborsScamFounded, setNeighborsScamFounded] = useState(null)

  const { data: message } = useSubscription(MESSAGE)
  const { data: scamNeighbors } = useSubscription(SCAM_FOUND)
  useEffect(() => {
    setSnackbarMessage({
      success: true, // todo use type
      message: get(message, 'messageNotify.message'),
    })
  }, [message])
  useEffect(() => {
    setNeighborsScamFounded(get(scamNeighbors, 'neighborsScamFounded'))
  }, [neighborsScamFounded])
  console.log(message)
  console.log(neighborsScamFounded)

  // todo in state of setMOdels write hook to store to local storage and to state
  const handleDrawerOpen = () => {
    setOpen(true)
  }
  const handleDrawerClose = () => {
    setOpen(false)
  }
  // TODO Powered by Etherscan.io APIs
  // TODO Powered by etherscamdb APIs
  return (
    <ModelContext.Provider value={{ models, setModels }}>
      <StepContext.Provider value={{ step, setStep }}>
        <SnackbarContext.Provider
          value={{ snackbarMessage, setSnackbarMessage }}
        >
          <ScamNeighborContext.Provider
            value={{ neighborsScamFounded, setNeighborsScamFounded }}
          >
            <BrowserRouter>
              <div className={classes.root}>
                <CustomAppBar open={open} handleDrawerOpen={handleDrawerOpen} />
                <LeftPanel open={open} handleDrawerClose={handleDrawerClose} />
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
    </ModelContext.Provider>
  )
}

export default App
