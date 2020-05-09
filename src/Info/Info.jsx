import React from 'react'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(1),
      width: theme.spacing(40),
      height: theme.spacing(32),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'visible', // scroll to visible for tests
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}))

const Info = () => {
  const classes = useStyles()
  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <div className={classes.root}>
        <Paper elevation={3}>
          This App developed in terms of master thesis "Analysis and
          visualisation of scam address in Ethereum network".
          <br />
          Author is Taras Kolba.
          <br />
          The app will be opened on github after handing the thesis to board of
          examiners.
        </Paper>
      </div>
    </main>
  )
}

export default Info
