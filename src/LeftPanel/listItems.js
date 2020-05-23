import React from 'react'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import GrainIcon from '@material-ui/icons/Grain'
import StorageIcon from '@material-ui/icons/Storage'
import BubbleChartIcon from '@material-ui/icons/BubbleChart'
import AssignmentIcon from '@material-ui/icons/Assignment'
import InfoIcon from '@material-ui/icons/Info'
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck'
import { Link } from 'react-router-dom'
// compare_arrows
export const mainListItems = classes => (
  <div>
    <Link to="/" className={classes.links}>
      <ListItem button>
        <ListItemIcon>
          <GrainIcon />
        </ListItemIcon>
        <ListItemText primary="Ethereum graph" />
      </ListItem>
    </Link>
    <Link to="/class" className={classes.links}>
      <ListItem button>
        <ListItemIcon>
          <StorageIcon />
        </ListItemIcon>
        <ListItemText primary="Data and models" />
      </ListItem>
    </Link>
    <Link to="/model" className={classes.links}>
      <ListItem button>
        <ListItemIcon>
          <PlaylistAddCheckIcon />
        </ListItemIcon>
        <ListItemText primary="Test of address" />
      </ListItem>
    </Link>
    <Link to="/searchneighbors" className={classes.links}>
      <ListItem button>
        <ListItemIcon>
          <BubbleChartIcon />
        </ListItemIcon>
        <ListItemText primary="Scam neighbors" />
      </ListItem>
    </Link>
  </div>
)

export const secondaryListItems = classes => (
  <div>
    <ListSubheader inset>Documentation and logs</ListSubheader>
    <Link to="/logs" className={classes.links}>
      <ListItem button>
        <ListItemIcon>
          <AssignmentIcon />
        </ListItemIcon>
        <ListItemText primary="Logs" />
      </ListItem>
    </Link>
    <Link to="/info" className={classes.links}>
      <ListItem button>
        <ListItemIcon>
          <InfoIcon />
        </ListItemIcon>
        <ListItemText primary="Info" />
      </ListItem>
    </Link>
  </div>
)
