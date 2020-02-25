import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ClassificationModel from './ClassificationModel'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
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

const ClassificationTest = () => {
  const classes = useStyles()

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <ClassificationModel />
    </main>
  )
}

export default ClassificationTest
