import Snackbar from '@material-ui/core/Snackbar'
import React, { useEffect, useState } from 'react'
import Alert from '@material-ui/lab/Alert'

const SnackbarMessage = ({ snackbarMessage }) => {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    setOpen(true)
  }, [snackbarMessage])
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }
  return (
    <Snackbar open={open} autoHideDuration={4000} onClose={handleClose}>
      <Alert
        variant="filled"
        onClose={handleClose}
        severity={snackbarMessage.success ? 'success' : 'warning'}
      >
        {snackbarMessage.message}
      </Alert>
    </Snackbar>
  )
}

export default SnackbarMessage
