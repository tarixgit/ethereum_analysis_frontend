import React, { useState } from 'react'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import EthereumGraph from './Graph/EthereumGraph'
import Classification from './DataAnalyse/Classification'
import CustomAppBar from './CustomAppBar'
import LeftPanel from './LeftPanel/LeftPanel'
import { makeStyles } from '@material-ui/core/styles'
import ClassificationTest from './AddressTest/ClassificationTest'
import SearchNeighbors from './SearchNeighbors/SearchNeighbors'
import Info from './Info/Info'
import Logs from './Logs/Logs'
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
  const { data: message, loading } = useSubscription(MESSAGE)
  const { data: neighborsScamFounded, loading_ } = useSubscription(SCAM_FOUND)
  console.log(message)
  console.log(neighborsScamFounded)
  console.log(loading_)
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
          </div>
        </BrowserRouter>
      </StepContext.Provider>
    </ModelContext.Provider>
  )
}

export default App
