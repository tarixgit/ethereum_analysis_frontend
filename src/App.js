import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from '@apollo/react-hooks'
import EthereumGraph from './EthereumGraph'
import Classification from './Classification'
import CustomAppBar from './CustomAppBar'
import LeftPanel from './LeftPanel'
import { makeStyles } from '@material-ui/core/styles'
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
  const [open, setOpen] = React.useState(true)
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
      <BrowserRouter>
        <div className={classes.root}>
          <CustomAppBar open={open} handleDrawerOpen={handleDrawerOpen} />
          <LeftPanel open={open} handleDrawerClose={handleDrawerClose} />
          <Switch>
            <Route path="/class">
              <Classification />
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
    </ApolloProvider>
  )
}

export default App
