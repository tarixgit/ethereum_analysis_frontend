import React, { Fragment } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import CustomAppBar from './CustomAppBar'
import LeftPanel from './LeftPanel'
import EthereumGraph from './EthereumGraph'

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
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
}))

export default function Dashboard() {
  const classes = useStyles()
  /*  const [open, setOpen] = React.useState(true)
  const handleDrawerOpen = () => {
    setOpen(true)
  }
  const handleDrawerClose = () => {
    setOpen(false)
  }*/

  return (
    <Fragment>
      {/*      <CustomAppBar open={open} handleDrawerOpen={handleDrawerOpen} />
      <LeftPanel open={open} handleDrawerClose={handleDrawerClose} />*/}
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container
          maxWidth="xl"
          className={classes.container}
          style={{ height: '100%' }}
        >
          <EthereumGraph />
        </Container>
      </main>
    </Fragment>
  )
}
