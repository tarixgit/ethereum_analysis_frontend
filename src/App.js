import React from 'react'
import Dashboard from './Dashboard'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from '@apollo/react-hooks'

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
const client = new ApolloClient({
  uri: 'http://localhost:3001/graphql',
})

const App = () => {
  return (
    <ApolloProvider client={client}>
      <div>
        <Dashboard />
      </div>
    </ApolloProvider>
  )
}

export default App
