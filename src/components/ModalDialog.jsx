import React from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

const ModalDialog = ({
  applyHandler,
  closeHandler,
  closeText,
  applyText,
  title,
  infoText,
}) => {
  return (
    <Dialog
      open={true}
      onClose={closeHandler}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {infoText}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeHandler} color="primary">
          {closeText}
        </Button>
        {applyHandler && (
          <Button onClick={applyHandler} color="primary" autoFocus>
            {applyText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ModalDialog
