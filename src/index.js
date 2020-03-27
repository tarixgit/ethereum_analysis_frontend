import React from 'react'
import ReactDOM from 'react-dom'
import CssBaseline from '@material-ui/core/CssBaseline'
import { ThemeProvider } from '@material-ui/core/styles'
import { IntlProvider } from 'react-intl'
import App from './App'
import theme from './theme'

ReactDOM.render(
  <ThemeProvider theme={theme}>
    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
    <CssBaseline />
    <IntlProvider locale="en">
      <App />
    </IntlProvider>
  </ThemeProvider>,
  document.querySelector('#root')
)

// serviceWorker.unregister();
