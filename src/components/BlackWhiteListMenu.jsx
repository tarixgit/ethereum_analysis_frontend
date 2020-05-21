import Paper from '@material-ui/core/Paper'
import React, { Fragment, useCallback, useState, useRef } from 'react'
import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import Popper from '@material-ui/core/Popper'
import Grow from '@material-ui/core/Grow'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import MenuList from '@material-ui/core/MenuList'
import MenuItem from '@material-ui/core/MenuItem'
import Grid from '@material-ui/core/Grid'

const BlackWhiteListMenu = ({ importData, openInfoModal }) => {
  const anchorRef = useRef(null)
  const [open, setOpen] = useState(false)
  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }
  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return
    }

    setOpen(false)
  }
  const importDataHandler = useCallback(() => {
    handleToggle()
    importData()
  })
  const openInfoModalHandler = useCallback(() => {
    handleToggle()
    openInfoModal()
  })

  return (
    <Fragment>
      <IconButton
        ref={anchorRef}
        aria-label="more"
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <MoreVertIcon />
      </IconButton>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        placement="bottom-end"
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={importDataHandler}>
                <MenuList autoFocusItem={open} id="menu-list-grow">
                  <MenuItem onClick={importData}>
                    Import blacklist data
                  </MenuItem>
                  <MenuItem onClick={openInfoModalHandler}>Info</MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Fragment>
  )
}

export default BlackWhiteListMenu
