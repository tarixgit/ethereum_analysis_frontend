import React, { useState } from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from '@apollo/react-hooks'
import EthereumGraph from './Graph/EthereumGraph'
import Classification from './DataAnalyse/Classification'
import CustomAppBar from './CustomAppBar'
import LeftPanel from './LeftPanel/LeftPanel'
import { makeStyles } from '@material-ui/core/styles'
import ClassificationTest from './AddressTest/ClassificationTest'
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
  },
  setModel: () => {},
})

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
}))

const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL,
})

const App = () => {
  const classes = useStyles()
  const [open, setOpen] = useState(true)
  const [models, setModels] = useState({
    lg: null,
    rf: null,
    knn: null,
  })
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
    <ApolloProvider client={client}>
      <ModelContext.Provider value={{ models, setModels }}>
        <BrowserRouter>
          <div className={classes.root}>
            <CustomAppBar open={open} handleDrawerOpen={handleDrawerOpen} />
            <LeftPanel open={open} handleDrawerClose={handleDrawerClose} />
            <Switch>
              <Route path="/class">
                <Classification />
              </Route>
              <Route path="/model">
                <ClassificationTest />
              </Route>
              <Route path="/:hash">
                <EthereumGraph />
              </Route>
              <Route path="/">
                <EthereumGraph />
              </Route>
            </Switch>
          </div>
        </BrowserRouter>
      </ModelContext.Provider>
    </ApolloProvider>
  )
}

export default App
