import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import StepLabel from '@material-ui/core/StepLabel'
import Stepper from '@material-ui/core/Stepper'
import Typography from '@material-ui/core/Typography'
import Step from '@material-ui/core/Step'
import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import Paper from '@material-ui/core/Paper'
import ImportAddressTable from './ImportAddressTable'
import FeatureTable from './FeatureTable'
import ClassificationModel from './ClassificationModel'

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
    recalcFeatures {
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
    overflow: 'visible', // scroll to visible for tests
  },
  stepButton: {
    flex: 1,
  },
  stepper: {
    flex: 15,
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
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
      return 'Model training and testing'
    default:
      return 'Unknown stepIndex'
  }
}

const Classification = () => {
  const classes = useStyles()
  const [activeStep, setActiveStep] = React.useState(1)
  const steps = getSteps()
  const [importData] = useMutation(IMPORT_DATA)
  const [buildFeatures, { loading }] = useMutation(BUILD_FEATURES, {
    cachePolicy: 'no-cache',
    ignoreResults: true,
    optimisticResponse: {
      success: true,
      message: 'ok',
    },
  })
  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
  }
  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <div className={classes.stepperHeader}>
        <Button
          className={classes.stepButton}
          variant="contained"
          color="primary"
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        <Stepper
          className={classes.stepper}
          activeStep={activeStep}
          alternativeLabel
        >
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Button
          className={classes.stepButton}
          variant="contained"
          color="primary"
          onClick={handleNext}
        >
          {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </div>
      {activeStep === steps.length ? (
        <div>
          <Typography className={classes.instructions}>
            All steps completed
          </Typography>
          <Button onClick={handleReset}>Reset</Button>
        </div>
      ) : (
        <div>
          {activeStep === 0 && <ImportAddressTable importData={importData} />}
          {activeStep === 1 && (
            <FeatureTable
              buildFeatures={buildFeatures}
              buildRunning={loading}
            />
          )}
          {activeStep === 2 && <ClassificationModel />}
          <Typography className={classes.instructions}>
            {getStepContent(activeStep)}
          </Typography>
        </div>
      )}
    </main>
  )
}

export default Classification
