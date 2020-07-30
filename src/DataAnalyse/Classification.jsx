import React, { useContext, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Button from '@material-ui/core/Button'
import Stepper from '@material-ui/core/Stepper'
import Typography from '@material-ui/core/Typography'
import Step from '@material-ui/core/Step'
import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import ImportAddressTable from './ImportAddressTable'
import FeatureTable from './FeatureTable'
import ClassificationModel from './ClassificationModel'
import Grid from '@material-ui/core/Grid'
import { SnackbarContext, StepContext } from '../App'
import ClassificationModelWebWorker from './ClassificationModelWebWorker'
import StepButton from '@material-ui/core/StepButton'
import { get } from 'lodash'
import ModalDialog from '../components/ModalDialog'

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
  mutation RecalcFeatures {
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

const getSteps = () => ['Black & white addresses', 'Features', 'Model']

const getStepContent = stepIndex => {
  switch (stepIndex) {
    case 0:
      return 'Data is from https://etherscamdb.info'
    case 1:
      return 'Features Analyse'
    case 2:
      return 'Model training'
    default:
      return 'Unknown stepIndex'
  }
}

const Classification = (callback, deps) => {
  const classes = useStyles()
  const [isOpen, setOpenModal] = useState(false)
  const [isInfoOpen, setInfoOpen] = useState(false)
  const [info, setInfo] = useState({ title: 'Info', infoText: '-' })
  const { step, setStep } = useContext(StepContext)
  const { setSnackbarMessage } = useContext(SnackbarContext)
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
      setSnackbarMessage(importDataResponse)
    },
  })
  const [buildFeatures, { loading }] = useMutation(BUILD_FEATURES, {
    cachePolicy: 'no-cache',
    ignoreResults: true,
    onCompleted: data => {
      const importDataResponse = get(data, 'buildFeaturesThread', {
        success: null,
        message: null,
      })
      if (!importDataResponse.message) {
        return
      }
      setSnackbarMessage(importDataResponse)
    },
  })
  const [recalcFeatures, { loading: loading_ }] = useMutation(RECALC_FEATURES, {
    cachePolicy: 'no-cache',
    onCompleted: data => {
      const importDataResponse = get(data, 'recalcFeaturesThread', {
        success: null,
        message: null,
      })
      if (!importDataResponse.message) {
        return
      }
      setSnackbarMessage(importDataResponse)
    },
  })
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

  const closeModal = () => {
    setOpenModal(false)
  }

  const openModal = () => {
    // later you can do a universal modal window
    setOpenModal(true)
  }

  const closeInfoModal = () => {
    setInfoOpen(false)
  }

  const openInfo = ({ title, infoText }) => {
    // later you can do a universal modal window
    setInfo({ title, infoText })
    setInfoOpen(true)
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
                  disabled={step === steps.length - 1}
                  onClick={handleNext}
                >
                  {step === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            {step === 0 && (
              <ImportAddressTable importData={importData} openInfo={openInfo} />
            )}
            {step === 1 && (
              <FeatureTable
                buildFeatures={buildFeatures}
                recalcFeatures={openModal}
                openInfo={openInfo}
              />
            )}
            {step === 2 &&
              typeof Worker === 'undefined' &&
              "Your browser doesn't support the webworker. Please change your browser or contact the administrator"}
            {step === 2 && typeof Worker !== 'undefined' && (
              <ClassificationModelWebWorker />
            )}
            <Typography className={classes.instructions}>
              {getStepContent(step)}
            </Typography>
          </Grid>
        </Grid>
        {isOpen && (
          <ModalDialog
            applyHandler={recalcFeatures}
            closeHandler={closeModal}
            closeText="Close"
            applyText="Run"
            title="Run the recalculation of all existing address features "
            infoText="This calculation will be executed in separate thread. Nevertheless this calculation will take a lot of hours, because some addresses have ca. 400 thousands of transaction, that must be taken from database and calculated."
          />
        )}
        {isInfoOpen && (
          <ModalDialog
            closeHandler={closeInfoModal}
            closeText="Close"
            title={info.title}
            infoText={info.infoText}
          />
        )}
      </Container>
    </main>
  )
}

export default Classification
