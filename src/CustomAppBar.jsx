import clsx from 'clsx'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import Typography from '@material-ui/core/Typography'
import Badge from '@material-ui/core/Badge'
import HelpIcon from '@material-ui/icons/Help'
import AppBar from '@material-ui/core/AppBar'
import React, { Fragment, useState } from 'react'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { useLocation, useParams, useRouteMatch } from 'react-router-dom'
import Tooltip from '@material-ui/core/Tooltip'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'

const drawerWidth = 240

const useStyles = makeStyles(theme => ({
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
}))

const HtmlTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip)

const tooltipTitles = {
  class: (
    <Fragment>
      <Typography color="inherit">Classification section</Typography>
      {'Some functionality: '}
      <ul style={{ margin: 0 }}>
        <li>Here showed the lists of imported addresses and features.</li>
        <li>You can train the models for classification of scam addresses</li>
        <li>You can use some functionality in menus on the lists</li>
        <li>To test the addresses there is separate section in main menu</li>
      </ul>
    </Fragment>
  ),
  model: (
    <Fragment>
      <Typography color="inherit">Testing section</Typography>
      The section is for testing/checking addresses based on the models created
      in "Data and models" sections. If the address looks like scam address or
      not
    </Fragment>
  ),
  searchneighbors: (
    <Fragment>
      <Typography color="inherit">Searching for suspicion neighbors</Typography>
      The algorithm search recursive in the neighbors the scam addresses. Per
      default the algorithm goes until third level of neighbors, because of
      hardware limitation. Searching are running thread.
    </Fragment>
  ),
  info: (
    <Fragment>
      <Typography color="inherit">Info</Typography>
      Some information about app
    </Fragment>
  ),
  logs: (
    <Fragment>
      <Typography color="inherit">Logs</Typography>
      There is three type of calculation that can be run in threads. You can see
      here the logs from that threads.
    </Fragment>
  ),
  graph: (
    <Fragment>
      <Typography color="inherit">Ethereum grpah</Typography>
      {'Some functionality: '}
      <ul style={{ margin: 0 }}>
        <li>The graph will not be erased after new address added</li>
        <li>You can use right click to load more for selected node</li>
      </ul>
      {/*
                    <em>{"And here's"}</em> <b>{'some'}</b>{' '}
                    <u>{'amazing content'}</u>. {"It's very engaging. Right?"}
*/}
    </Fragment>
  ),
}

const CustomAppBar = ({ handleDrawerOpen, open }) => {
  const classes = useStyles()
  const [isTooltipOpen, setOpen] = useState(false)
  let match = useRouteMatch('/:page')
  let tooltipTitle = 'No info'
  if (match) {
    const { page } = match && match.params ? match.params : null
    tooltipTitle = tooltipTitles[page] ? tooltipTitles[page] : tooltipTitle
    tooltipTitle = !page ? tooltipTitles.graph : tooltipTitle
    // TODO dsa gleiche auch für Titel machen
  }

  const handleTooltipClose = () => {
    setOpen(false)
  }

  const handleTooltipOpen = () => {
    setOpen(true)
  }
  return (
    <div>
      <AppBar
        position="absolute"
        className={clsx(classes.appBar, open && classes.appBarShift)}
      >
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(
              classes.menuButton,
              open && classes.menuButtonHidden
            )}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Ethereum analysis
          </Typography>
          <ClickAwayListener onClickAway={handleTooltipClose}>
            <div>
              <HtmlTooltip
                title={tooltipTitle}
                placement="bottom-start"
                open={isTooltipOpen}
                disableFocusListener
                disableHoverListener
              >
                <IconButton color="inherit" onClick={handleTooltipOpen}>
                  <HelpIcon />
                </IconButton>
              </HtmlTooltip>
            </div>
          </ClickAwayListener>
        </Toolbar>
      </AppBar>
    </div>
  )
}

export default CustomAppBar
