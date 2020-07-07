import React, { Fragment, useContext, useEffect, useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {
  map,
  get,
  filter,
  take,
  shuffle,
  truncate,
  compact,
  random,
} from 'lodash'
import memoizeOne from 'memoize-one'
import { makeStyles } from '@material-ui/core/styles'
import { Paper, Button, CircularProgress, TextField } from '@material-ui/core'
import { green } from '@material-ui/core/colors'
import {
  RandomForestClassifier as RFClassifier,
  RandomForestRegression as RFRegression,
} from 'ml-random-forest'
import clsx from 'clsx'
import LogisticRegression from 'ml-logistic-regression'
import { Matrix } from 'ml-matrix' //"ml-matrix": "5.3.0",
import KNN from 'ml-knn'
import WebWorker from 'react-webworker'
import CollapsibleTable from '../components/CollapsibleTable'
import { ModelContext } from '../App'
import { GaussianNB } from 'ml-naivebayes'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import CardContent from '@material-ui/core/CardContent'
import Card from '@material-ui/core/Card'
import PrecisionTable from '../components/PrecisionTable'

const myWorker = new Worker('./classifier.worker.js', { type: 'module' }) // relative path to the source file, not the public URL

const LOAD_ADDRESS_FEATURES = gql`
  query AddressFeatures($offset: Int!, $limit: Int!) {
    addressFeatures(offset: $offset, limit: $limit) {
      rows {
        id
        hash
        scam
        numberOfNone
        numberOfOneTime
        numberOfExchange
        numberOfMiningPool
        numberOfMiner
        numberOfSmContract
        numberOfERC20
        numberOfERC721
        numberOfTrace
        medianOfEthProTrans
        averageOfEthProTrans
        numberOfTransInput
        numberOfTransOutput
        numberOfTransactions
      }
      count
    }
  }
`
const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  buttonSection: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  title: {
    fontSize: 14,
  },
  card: {
    minWidth: 275,
  },
}))
const rfOptions = {
  seed: 3, // for random function(MersenneTwister) for bagging
  maxFeatures: 0.8, // part of features used for bagging
  replacement: true, // for bagging
  nEstimators: 25,
}
const lgOptions = {
  numSteps: 1000,
  learningRate: 5e-3,
}
const loadAndSaveModels = memoizeOne(newModels => {
  const rf = RFClassifier.load(newModels.rf)
  const lg = LogisticRegression.load(newModels.lg)
  const knn = KNN.load(newModels.knn)
  const gaussianNB = GaussianNB.load(newModels.gaussianNB)
  const rfRegression = RFClassifier.load(newModels.regression)
  sessionStorage.setItem('rf', rf)
  sessionStorage.setItem('lg', lg)
  sessionStorage.setItem('knn', knn)
  return { rf, lg, knn, newModelsJSON: newModels, gaussianNB, rfRegression }
})

export const fitAndGetFeature = item => {
  const {
    numberOfNone,
    numberOfOneTime,
    numberOfExchange,
    numberOfMiningPool,
    numberOfMiner,
    numberOfSmContract,
    numberOfERC20,
    numberOfERC721,
    numberOfTrace,
    medianOfEthProTrans,
    averageOfEthProTrans,
    numberOfTransInput,
    numberOfTransOutput,
    numberOfTransactions,
  } = item
  const sumOfNeigbours =
    numberOfNone +
    numberOfOneTime +
    numberOfExchange +
    numberOfMiningPool +
    numberOfMiner +
    numberOfSmContract +
    numberOfERC20 +
    numberOfERC721 +
    numberOfTrace
  return [
    numberOfNone / sumOfNeigbours,
    numberOfOneTime / sumOfNeigbours,
    numberOfExchange / sumOfNeigbours,
    numberOfMiningPool / sumOfNeigbours,
    numberOfMiner / sumOfNeigbours,
    numberOfSmContract / sumOfNeigbours,
    numberOfERC20 / sumOfNeigbours,
    numberOfERC721 / sumOfNeigbours,
    numberOfTrace / sumOfNeigbours,
    medianOfEthProTrans,
    averageOfEthProTrans,
    numberOfTransInput / numberOfTransactions,
    numberOfTransOutput / numberOfTransactions,
    // numberOfTransaction,
  ]
}
const fitAndGetFeatures = data => {
  return map(data, fitAndGetFeature)
}

const customRound = number => (number >= 0.5 ? 1 : 0)

const calcAccuracyRate = (predicted, predictedMustBe) => {
  const isCorrect = map(
    predicted,
    (x, index) => x === customRound(predictedMustBe[index])
  )
  const correctNumber = compact(isCorrect)
  return correctNumber.length / isCorrect.length
}
const calcConfusionMatrix = (predicted, predictedMustBe) => {
  let truePositive = 0
  let trueNegative = 0
  let falsePositive = 0
  let falseNegative = 0
  for (let i = 0; i < predictedMustBe.length; i++) {
    if (
      predictedMustBe[i] === 1 &&
      predictedMustBe[i] === customRound(predicted[i])
    ) {
      truePositive = truePositive + 1
    }
    if (
      predictedMustBe[i] === 1 &&
      predictedMustBe[i] !== customRound(predicted[i])
    ) {
      falseNegative = falseNegative + 1
    }
    if (
      predictedMustBe[i] === 0 &&
      predictedMustBe[i] === customRound(predicted[i])
    ) {
      trueNegative = trueNegative + 1
    }
    if (
      predictedMustBe[i] === 0 &&
      predictedMustBe[i] !== customRound(predicted[i])
    ) {
      falsePositive = falsePositive + 1
    }
  }
  return { truePositive, trueNegative, falsePositive, falseNegative }
}

const checkAccuracy = (models, testData, testDataPrediction) => {
  const { lg, rf, knn, gaussianNB, rfRegression } = models
  const confusionMatrix = {}
  const predicted = rf.predict(testData)
  const predictedLogreg = lg.predict(new Matrix(testData))
  const predictedKNN = knn.predict(testData)
  const predictedgaussianNB = gaussianNB.predict(testData)
  const predictedRFRegression = rfRegression.predict(testData)

  confusionMatrix.rf = calcConfusionMatrix(predicted, testDataPrediction)
  confusionMatrix.lg = calcConfusionMatrix(predictedLogreg, testDataPrediction)
  confusionMatrix.knn = calcConfusionMatrix(predictedKNN, testDataPrediction)
  confusionMatrix.nb = calcConfusionMatrix(
    predictedgaussianNB,
    testDataPrediction
  )
  const precisionRf = calcAccuracyRate(predicted, testDataPrediction)
  const precisionLR = calcAccuracyRate(predictedLogreg, testDataPrediction)
  const precisionKNN = calcAccuracyRate(predictedKNN, testDataPrediction)
  const precisionNB = calcAccuracyRate(predictedgaussianNB, testDataPrediction)
  return {
    precisionRf,
    precisionLR,
    precisionKNN,
    precisionNB,
    confusionMatrix,
  }
}

const oversampling = rows => {
  const scamAdd = filter(rows, { scam: true })
  const notScamAdd = filter(rows, { scam: false })
  if (scamAdd.length - notScamAdd.length > 0) {
    const notScamAddSource = [...notScamAdd]
    const duplicateCount = scamAdd.length - notScamAddSource.length
    for (let i = 0; i < duplicateCount; i++) {
      notScamAdd.push(notScamAddSource[random(notScamAddSource.length - 1)])
    }
  } else {
    const scamAddSource = [...scamAdd]
    const duplicateCount = notScamAdd.length - scamAddSource.length
    for (let i = 0; i < duplicateCount; i++) {
      scamAdd.push(scamAddSource[random(scamAddSource.length - 1)])
    }
  }
  return [...scamAdd, ...notScamAdd]
}

const ClassificationModelWebWorker = (callback, deps) => {
  const classes = useStyles()
  const { models, setModels } = useContext(ModelContext)
  const [modelsLocal, setModelsLocal] = useState({
    lg: null,
    rf: null,
    knn: null,
    newModelsJSON: null,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [oversamplingOn, setOversamplingOn] = useState(true)
  const { newModelsJSON } = modelsLocal // not neccessary after memoizeOne
  const buttonClassname = clsx({
    [classes.buttonSuccess]: success,
  })

  const [trainingData, setTrainingData] = useState(null)
  const [trainingDataPredictions, setTrainingDataPredictions] = useState(null)
  const [testData, setTestData] = useState(null)
  const [testDataPrediction, setTestDataPrediction] = useState(null)
  const [precision, setPrecision] = useState({
    precisionRf: 0,
    precisionLR: 0,
    precisionKNN: 0,
    precisionNB: 0,
    confusionMatrix: {
      rf: null,
      lr: null,
      knn: null,
      nb: null,
    },
  })
  const [rfSettings, onSubmitRf] = useState(rfOptions)
  const [lgSettings, onSubmitLg] = useState(lgOptions)
  const [knnSettings, onSubmitKNN] = useState(null) // empty now

  const { data, loading: loadingApi, networkStatus } = useQuery(
    LOAD_ADDRESS_FEATURES,
    {
      variables: { offset: 0, limit: 0 },
    }
  )
  const rows = get(data, 'addressFeatures.rows', [])
  if (!loadingApi && networkStatus === 7 && !trainingData) {
    const rowsShuffled = oversamplingOn
      ? shuffle(oversampling(rows))
      : shuffle(rows)
    const fullSet = fitAndGetFeatures(rowsShuffled)
    // separate train and test data
    const fullPredictions = map(rowsShuffled, ({ scam }) => (scam ? 1 : 0))
    setTrainingData(fullSet)
    setTrainingDataPredictions(fullPredictions)
    setTestData(fullSet)
    setTestDataPrediction(fullPredictions)

    // setTrainingData(take(fullSet, rows.length * 0.9))
    // setTrainingDataPredictions(take(fullPredictions, rows.length * 0.9))
    // setTestData(takeRight(fullSet, rows.length * 0.1))
    // setTestDataPrediction(takeRight(fullPredictions, rows.length * 0.1))
  }
  useEffect(() => {
    if (trainingData) {
      const { lg, rf, knn, gaussianNB, rfRegression } = modelsLocal
      if (lg && rf && knn) {
        const stats = checkAccuracy(modelsLocal, testData, testDataPrediction)
        setPrecision(stats)
        setModels({ ...modelsLocal, stats })
      }
    }
  }, [newModelsJSON, trainingData])

  // useEffect(() => {
  //   return () => {
  //     myWorker.terminate()
  //     // myWorker = undefined
  //   }
  // }, [])
  const { confusionMatrix } = precision
  return (
    <Fragment>
      <WebWorker
        // url="/classifier.worker.js"
        worker={myWorker}
        parser={JSON.parse}
        serializer={JSON.stringify}
      >
        {({ data, error, postMessage, updatedAt, lastPostAt }) => {
          if (data) {
            const { newModels } = data
            setModelsLocal(loadAndSaveModels(newModels))
          }
          const spinner = (!updatedAt && lastPostAt) || updatedAt < lastPostAt
          return (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper elevation={3} className={classes.root}>
                  <div className={classes.buttonSection}>
                    <Button
                      color="primary"
                      className={buttonClassname}
                      disabled={spinner}
                      onClick={() =>
                        postMessage({
                          trainingData,
                          trainingDataPredictions,
                          rfSettings,
                          lgSettings,
                        })
                      }
                      variant="contained"
                    >
                      Train
                    </Button>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={oversamplingOn}
                          onChange={e => setOversamplingOn(e.target.checked)}
                          name="checkedB"
                          color="primary"
                        />
                      }
                      label="Oversampling"
                    />
                  </div>

                  <Paper elevation={0} className={classes.paper}>
                    <CollapsibleTable
                      columns={[
                        { id: 'classifier', name: 'Classifier' },
                        { id: 'accuracy', name: 'Accuracy [0;1]' },
                      ]}
                      rows={[
                        {
                          id: 'idPrecision_rf',
                          classifier: {
                            value: 'Random forest',
                          },
                          accuracy: { value: precision.precisionRf },
                        },
                        {
                          id: 'idPrecision_lg',
                          classifier: {
                            value: 'Logistik regression',
                          },
                          accuracy: { value: precision.precisionLR },
                        },
                        {
                          id: 'idPrecision_KNN',
                          classifier: {
                            value: 'K-nearest neighbors',
                          },
                          accuracy: { value: precision.precisionKNN },
                        },
                        {
                          id: 'idPrecision_NB',
                          classifier: {
                            value: 'Naive Bayes',
                          },
                          accuracy: { value: precision.precisionNB },
                        },
                      ]}
                      onSubmitRf={onSubmitRf}
                      onSubmitLg={onSubmitLg}
                      onSubmitKNN={onSubmitKNN}
                      rfSettings={rfSettings}
                      lgSettings={lgSettings}
                    />
                    {error ? `Something went wrong: ${error.message}` : ''}
                    {spinner && (
                      <CircularProgress
                        size={40}
                        className={classes.buttonProgress}
                      />
                    )}
                  </Paper>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={2} className={classes.paper}>
                  {confusionMatrix.rf && (
                    <Card className={classes.card}>
                      <CardContent>
                        <Typography
                          className={classes.title}
                          color="textSecondary"
                          gutterBottom
                        >
                          Random forest
                        </Typography>
                        <PrecisionTable precisionData={confusionMatrix.rf} />
                      </CardContent>
                    </Card>
                  )}
                  {confusionMatrix.lg && (
                    <Card className={classes.card}>
                      <CardContent>
                        <Typography
                          className={classes.title}
                          color="textSecondary"
                          gutterBottom
                        >
                          Logistik regression
                        </Typography>
                        <PrecisionTable precisionData={confusionMatrix.lg} />
                      </CardContent>
                    </Card>
                  )}
                  {confusionMatrix.knn && (
                    <Card className={classes.card}>
                      <CardContent>
                        <Typography
                          className={classes.title}
                          color="textSecondary"
                          gutterBottom
                        >
                          K-nearest neighbors
                        </Typography>
                        <PrecisionTable precisionData={confusionMatrix.knn} />
                      </CardContent>
                    </Card>
                  )}
                  {confusionMatrix.nb && (
                    <Card className={classes.card}>
                      <CardContent>
                        <Typography
                          className={classes.title}
                          color="textSecondary"
                          gutterBottom
                        >
                          Naive Bayes classifier
                        </Typography>
                        <PrecisionTable precisionData={confusionMatrix.nb} />
                      </CardContent>
                    </Card>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )
        }}
      </WebWorker>
    </Fragment>
  )
}

export default ClassificationModelWebWorker
