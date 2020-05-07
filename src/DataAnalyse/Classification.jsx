import React from 'react'
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
      return 'Model training and testing'
    default:
      return 'Unknown stepIndex'
  }
}

const Classification = () => {
  const classes = useStyles()
  const [activeStep, setActiveStep] = React.useState(2)
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
      <Container maxWidth="xl" className={classes.container}>
        {/*<div className={classes.stepperHeader}>*/}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container justify="space-between" alignItems="center">
              <Grid item xs={3} md={2} lg={1}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                >
                  Back
                </Button>
              </Grid>
              <Grid item xs={6} md={8} lg={10}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map(label => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
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
                  {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
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
          </Grid>
        </Grid>
      </Container>
    </main>
  )
}

export default Classification