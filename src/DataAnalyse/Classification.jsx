import React, { useCallback, useContext, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Button from '@material-ui/core/Button'
import StepLabel from '@material-ui/core/StepLabel'
import Stepper from '@material-ui/core/Stepper'
import Typography from '@material-ui/core/Typography'
import Step from '@material-ui/core/Step'
import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import ImportAddressTable from './ImportAddressTable'
import FeatureTable from './FeatureTable'
import ClassificationModel from './ClassificationModel'
import Grid from '@material-ui/core/Grid'
import { StepContext } from '../App'
import ClassificationModelWebWorker from './ClassificationModelWebWorker'
import StepButton from '@material-ui/core/StepButton'
import Snackbar from '@material-ui/core/Snackbar'
import MuiAlert from '@material-ui/lab/Alert'
import { get } from 'lodash'

const IMPORT_DATA = gql`
  mutation LoadData {
    loadData {
      success
      message
    }
  }
`

const BUILD_FEATURES = gql`
  mutation BuildFeatures {
    buildFeaturesThread {
      success
      message
    }
  }
`
const RECALC_FEATURES = gql`
  mutation BuildFeatures {
    recalcFeaturesThread {
      success
      message
    }
  }
`

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  stepperHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
    // overflowY: 'visible', // scroll to visible for tests
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  container: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  nextButton: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },
}))

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

const getSteps = () => ['Black & white addresses', 'Features', 'Model']

const getStepContent = stepIndex => {
  switch (stepIndex) {
    case 0:
      return 'Data is from https://etherscamdb.info'
    case 1:
      return 'Features Analyse'
    case 2:
      return 'Model training and testing'
    default:
      return 'Unknown stepIndex'
  }
}

const Classification = (callback, deps) => {
  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState({
    success: null,
    message: null,
  })
  //snackbarMessage
  const { step, setStep } = useContext(StepContext)
  const steps = getSteps()
  const [importData] = useMutation(IMPORT_DATA, {
    onCompleted: data => {
      const importDataResponse = get(data, 'loadData', {
        success: null,
        message: null,
      })
      if (!importDataResponse.message) {
        return
      }
      openSnackbar(importDataResponse)
    },
  })
  const [buildFeatures, { loading }] = useMutation(BUILD_FEATURES, {
    cachePolicy: 'no-cache',
    ignoreResults: true,
    optimisticResponse: {
      // todo check if needed?
      success: true,
      message: 'ok',
    },
    onCompleted: data => {
      const importDataResponse = get(data, 'loadData', {
        success: null,
        message: null,
      })
      if (!importDataResponse.message) {
        return
      }
      openSnackbar(importDataResponse)
    },
  })
  const [recalcFeatures, { loading: loading_ }] = useMutation(RECALC_FEATURES, {
    cachePolicy: 'no-cache',
    onCompleted: data => {
      const importDataResponse = get(data, 'loadData', {
        success: null,
        message: null,
      })
      if (!importDataResponse.message) {
        return
      }
      openSnackbar(importDataResponse)
    },
  })
  // const handleOpenSnackbar = () => {
  //   setOpen(true)
  // }
  const openSnackbar = useCallback(message => {
    setSnackbarMessage(message)
    setOpen(true)
  })
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }
  const handleNext = () => {
    setStep(prevActiveStep =>
      prevActiveStep === 2 ? prevActiveStep : prevActiveStep + 1
    )
  }

  const handleBack = () => {
    setStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleStep = step => () => {
    setStep(step)
  }
  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Container maxWidth="xl" className={classes.container}>
        {/*<div className={classes.stepperHeader}>*/}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container justify="space-between" alignItems="center">
              <Grid item xs={3} md={2} lg={1}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={step === 0}
                  onClick={handleBack}
                >
                  Back
                </Button>
              </Grid>
              <Grid item xs={6} md={8} lg={10}>
                <Stepper activeStep={step} alternativeLabel nonLinear>
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepButton onClick={handleStep(index)} completed={false}>
                        {label}
                      </StepButton>
                    </Step>
                  ))}
                </Stepper>
              </Grid>
              <Grid item xs={3} md={2} lg={1} className={classes.nextButton}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  {step === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            {step === 0 && (
              <ImportAddressTable
                importData={importData}
                openSnackbar={openSnackbar}
              />
            )}
            {step === 1 && (
              <FeatureTable
                buildFeatures={buildFeatures}
                recalcFeatures={recalcFeatures}
                openSnackbar={openSnackbar}
              />
            )}
            {step === 2 && typeof Worker === 'undefined' && (
              <ClassificationModel openSnackbar={openSnackbar} />
            )}
            {step === 2 && typeof Worker !== 'undefined' && (
              <ClassificationModelWebWorker openSnackbar={openSnackbar} />
            )}
            <Typography className={classes.instructions}>
              {getStepContent(step)}
            </Typography>
          </Grid>
        </Grid>
      </Container>
      <Snackbar open={open} autoHideDuration={2000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={snackbarMessage.success ? 'success' : 'warning'}
        >
          {snackbarMessage.message}
        </Alert>
      </Snackbar>
    </main>
  )
}

export default Classification
