import React, { Fragment, useContext, useEffect, useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {
  map,
  get,
  filter,
  take,
  shuffle,
  takeRight,
  compact,
  random,
  ceil,
} from 'lodash'
import memoizeOne from 'memoize-one'
import { makeStyles } from '@material-ui/core/styles'
import { Paper, Button, CircularProgress, TextField } from '@material-ui/core'
import { green } from '@material-ui/core/colors'
import { RandomForestClassifier as RFClassifier } from 'ml-random-forest'
import clsx from 'clsx'
import LogisticRegression from 'ml-logistic-regression'
import { Matrix } from 'ml-matrix' //"ml-matrix": "5.3.0",
import KNN from 'ml-knn'
import WebWorker from 'react-webworker'
import CollapsibleTable from '../components/CollapsibleTable'
import { ConfMatrixContext, ModelContext } from '../App'
// import { GaussianNB } from 'ml-naivebayes'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import CardContent from '@material-ui/core/CardContent'
import Card from '@material-ui/core/Card'
import PrecisionTable from '../components/PrecisionTable'
import Slider from '@material-ui/core/Slider'
import normed from 'ml-array-normed'
import download from 'downloadjs'

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
        numberOfNoneInput
        numberOfOneTimeInput
        numberOfExchangeInput
        numberOfMiningPoolInput
        numberOfMinerInput
        numberOfSmContractInput
        numberOfERC20Input
        numberOfERC721Input
        numberOfTraceInput
        transInputMedian
        transOutputMedian
        transInputAverage
        transOutputAverage
        minEth
        maxEth
        transInputMinEth
        transInputMaxEth
        transOutputMinEth
        transOutputMaxEth
        transInputMedianEth
        transInputAverageEth
        transOutputMedianMinEth
        transOutputAverageEth
        numberOfScamNeighbor
        numberOfScamNeighborInput
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
const sliderMarks = [
  {
    value: 0.1,
    label: 0.1,
  },
  {
    value: 0.2,
    label: 0.2,
  },
  {
    value: 0.3,
    label: 0.3,
  },
  {
    value: 0.4,
    label: 0.4,
  },
  {
    value: 0.5,
    label: 0.5,
  },
  {
    value: 0.6,
    label: 0.6,
  },
  {
    value: 0.7,
    label: 0.7,
  },
  {
    value: 0.8,
    label: 0.8,
  },
  {
    value: 0.9,
    label: 0.9,
  },
  {
    value: 1,
    label: 1,
  },
]
const rfOptions = {
  seed: undefined, // for random function(MersenneTwister) for bagging 42 default
  maxFeatures: 0.7, // part of features used for bagging
  replacement: false, // for bagging
  nEstimators: 7,
}
const lgOptions = {
  numSteps: 1500,
  learningRate: 55e-4,
}
const knnOptions = {
  k: 1,
}
const loadAndSaveModels = memoizeOne(newModels => {
  const rf = newModels.rf ? RFClassifier.load(newModels.rf) : null
  const lg = newModels.lg ? LogisticRegression.load(newModels.lg) : null
  const knn = newModels.knn ? KNN.load(newModels.knn) : null
  // const gaussianNB = newModels.gaussianNB
  //   ? GaussianNB.load(newModels.gaussianNB)
  //   : null
  sessionStorage.setItem('rf', rf)
  sessionStorage.setItem('lg', lg)
  sessionStorage.setItem('knn', knn)
  return { rf, lg, knn, newModelsJSON: newModels }
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
    numberOfNoneInput,
    numberOfOneTimeInput,
    numberOfExchangeInput,
    numberOfMiningPoolInput,
    numberOfMinerInput,
    numberOfSmContractInput,
    numberOfERC20Input,
    numberOfERC721Input,
    numberOfTraceInput,
    transInputMedian,
    transOutputMedian,
    transInputAverage,
    transOutputAverage,
    minEth,
    maxEth,
    transInputMinEth,
    transInputMaxEth,
    transOutputMinEth,
    transOutputMaxEth,
    transInputMedianEth,
    transInputAverageEth,
    transOutputMedianMinEth,
    transOutputAverageEth,
    numberOfScamNeighbor,
    numberOfScamNeighborInput,
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
    // numberOfERC721 / sumOfNeigbours,
    // numberOfTrace / sumOfNeigbours,
    medianOfEthProTrans,
    averageOfEthProTrans,
    numberOfTransInput / numberOfTransactions,
    numberOfTransOutput / numberOfTransactions,
    numberOfNoneInput,
    numberOfOneTimeInput,
    numberOfExchangeInput,
    numberOfMiningPoolInput,
    numberOfMinerInput,
    numberOfSmContractInput,
    numberOfERC20Input,
    // numberOfERC721Input,
    // numberOfTraceInput,
    transInputMedian,
    transOutputMedian,
    transInputAverage,
    transOutputAverage,
    minEth,
    maxEth,
    transInputMinEth,
    transInputMaxEth,
    transOutputMinEth,
    transOutputMaxEth,
    transInputMedianEth,
    transInputAverageEth,
    transOutputMedianMinEth,
    transOutputAverageEth,
    numberOfScamNeighbor,
    numberOfScamNeighborInput,
    numberOfTransactions, // was disabled
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
const getAcc = ({ truePositive, trueNegative, falsePositive, falseNegative }) =>
  (truePositive + trueNegative) /
  (truePositive + trueNegative + falsePositive + falseNegative)
const getPrec = ({ truePositive, falsePositive }) =>
  truePositive / (truePositive + falsePositive)
const getRecalc = ({ truePositive, falseNegative }) =>
  truePositive / (truePositive + falseNegative)
const calcStats = confMatrix => {
  const empty = () => ({
    rf: null,
    lg: null,
    knn: null,
    nb: null,
  })
  const accuracy = empty()
  const precision = empty()
  const recall = empty()
  if (confMatrix.rf) {
    accuracy.rf = getAcc(confMatrix.rf)
    precision.rf = getPrec(confMatrix.rf)
    recall.rf = getRecalc(confMatrix.rf)
  }
  if (confMatrix.lg) {
    accuracy.lg = getAcc(confMatrix.lg)
    precision.lg = getPrec(confMatrix.lg)
    recall.lg = getRecalc(confMatrix.lg)
  }
  if (confMatrix.knn) {
    accuracy.knn = getAcc(confMatrix.knn)
    precision.knn = getPrec(confMatrix.knn)
    recall.knn = getRecalc(confMatrix.knn)
  }
  if (confMatrix.nb) {
    accuracy.nb = getAcc(confMatrix.nb)
    precision.nb = getPrec(confMatrix.nb)
    recall.nb = getRecalc(confMatrix.nb)
  }
  return {
    accuracy,
    precision,
    recall,
  }
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
  const { lg, rf, knn } = models
  const confusionMatrix = {}
  if (rf) {
    const predicted = rf.predict(testData)
    confusionMatrix.rf = calcConfusionMatrix(predicted, testDataPrediction)
  }
  if (lg) {
    const predictedLogreg = lg.predict(new Matrix(testData))
    confusionMatrix.lg = calcConfusionMatrix(
      predictedLogreg,
      testDataPrediction
    )
  }
  if (knn) {
    const predictedKNN = knn.predict(testData)
    confusionMatrix.knn = calcConfusionMatrix(predictedKNN, testDataPrediction)
  }
  // if (gaussianNB) {
  //   const predictedgaussianNB = gaussianNB.predict(testData)
  //   confusionMatrix.nb = calcConfusionMatrix(
  //     predictedgaussianNB,
  //     testDataPrediction
  //   )
  // }

  return confusionMatrix
}

const oversampling = rows => {
  const scamAddSource = filter(rows, { scam: true })
  const notScamAddSource = filter(rows, { scam: false })
  const scamAdd = [...scamAddSource]
  const notScamAdd = [...notScamAddSource]
  if (scamAdd.length - notScamAdd.length > 0) {
    const duplicateCount = scamAdd.length - notScamAddSource.length
    for (let i = 0; i < duplicateCount; i++) {
      notScamAdd.push(notScamAddSource[random(notScamAddSource.length - 1)])
    }
  } else {
    const duplicateCount = notScamAdd.length - scamAddSource.length
    for (let i = 0; i < duplicateCount; i++) {
      scamAdd.push(scamAddSource[random(scamAddSource.length - 1)])
    }
  }
  return [...scamAdd, ...notScamAdd]
}

const ClassificationModelWebWorker = (callback, deps) => {
  const classes = useStyles()
  const { setModels } = useContext(ModelContext)
  const { setConfMatrix } = useContext(ConfMatrixContext)
  const [modelsLocal, setModelsLocal] = useState({
    lg: null,
    rf: null,
    knn: null,
    newModelsJSON: null,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [oversamplingOn, setOversamplingOn] = useState(true)
  const [trainSplit, setTrainSplit] = useState(1)
  const { newModelsJSON } = modelsLocal // not neccessary after memoizeOne
  const buttonClassname = clsx({
    [classes.buttonSuccess]: success,
  })

  const [trainingData, setTrainingData] = useState(null)
  const [trainingDataPredictions, setTrainingDataPredictions] = useState(null)
  const [testData, setTestData] = useState(null)
  const [testDataPrediction, setTestDataPrediction] = useState(null)
  const [confusionMatrix, setConfusionMatrix] = useState({
    rf: null,
    lg: null,
    knn: null,
    nb: null,
  })
  const [duration, setDuration] = useState({
    nb: null,
    rf: null,
    lg: null,
    knn: null,
  })

  const [rfSettings, onSubmitRf] = useState(rfOptions)
  const [lgSettings, onSubmitLg] = useState(lgOptions)
  const [knnSettings, onSubmitKNN] = useState(knnOptions)

  const { data: dataQ, loading: loadingApi, networkStatus } = useQuery(
    LOAD_ADDRESS_FEATURES,
    {
      variables: { offset: 0, limit: 0 },
    }
  )
  const rows = get(dataQ, 'addressFeatures.rows', [])
  useEffect(() => {
    if (!loadingApi && networkStatus === 7 && rows.length) {
      const rowsShuffled = oversamplingOn
        ? shuffle(oversampling(rows))
        : shuffle(rows)
      let fullSet = fitAndGetFeatures(rowsShuffled)
      // separate train and test data
      const fullPredictions = map(rowsShuffled, ({ scam }) => (scam ? 1 : 0))
      // data is fitted
      // normalising, to separate function
      const fullMatrix = new Matrix(fullSet)
      let x = []
      for (let i = 0; i < fullMatrix.columns; i++) {
        const col = fullMatrix.getColumn(i)
        x = normed(col, { algorithm: 'max' })
        fullMatrix.setColumn(i, normed(col, { algorithm: 'max' }))
      }
      fullSet = fullMatrix.to2DArray()
      // now splitting
      if (trainSplit === 1) {
        setTrainingData(fullSet)
        setTrainingDataPredictions(fullPredictions)
        setTestData(fullSet)
        setTestDataPrediction(fullPredictions)
      } else {
        const split = typeof trainSplit === 'number' ? trainSplit : 0.9
        setTrainingData(take(fullSet, rowsShuffled.length * split))
        setTrainingDataPredictions(
          take(fullPredictions, rowsShuffled.length * split)
        )
        setTestData(takeRight(fullSet, rowsShuffled.length * (1 - split)))
        setTestDataPrediction(
          takeRight(fullPredictions, rowsShuffled.length * (1 - split))
        )
      }
    }
  }, [loadingApi, networkStatus, trainSplit])

  useEffect(() => {
    if (trainingData) {
      const { lg, rf, knn } = modelsLocal
      const conMatrix = checkAccuracy(modelsLocal, testData, testDataPrediction)
      setConfusionMatrix(conMatrix)
      if (lg && rf && knn) {
        const fullConMatrix = checkAccuracy(
          modelsLocal,
          testData,
          testDataPrediction
        )
        setConfusionMatrix(fullConMatrix)
        setConfMatrix(fullConMatrix)
        setModels({ ...modelsLocal })
      }
    }
  }, [newModelsJSON, trainingData])

  // useEffect(() => {
  //   return () => {
  //     myWorker.terminate()
  //     // myWorker = undefined
  //   }
  // }, [])
  const stats = calcStats(confusionMatrix)
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
            const { rfStatsArray, lgStatsArray, knnStatsArray } = data
            const headers = ['precision', 'recall', 'accuracy'].join(';')
            const rowsString1 = map(rfStatsArray, row => row.join(';')).join(
              '\r\n'
            )
            const rowsString2 = map(lgStatsArray, row => row.join(';')).join(
              '\r\n'
            )
            const rowsString3 = map(knnStatsArray, row => row.join(';')).join(
              '\r\n'
            )
            // TODO add improvement with unit8Byte
            download(
              `data:text/csv;charset=utf-8,\ufeff${encodeURI(
                `${headers}\r\n${rowsString1}`
              )}`,
              `addressFeature-${new Date().toISOString()}.csv`,
              'text/csv'
            )
            download(
              `data:text/csv;charset=utf-8,\ufeff${encodeURI(
                `${headers}\r\n${rowsString2}`
              )}`,
              `addressFeature-${new Date().toISOString()}.csv`,
              'text/csv'
            )
            download(
              `data:text/csv;charset=utf-8,\ufeff${encodeURI(
                `${headers}\r\n${rowsString3}`
              )}`,
              `addressFeature-${new Date().toISOString()}.csv`,
              'text/csv'
            )
            // const { newModels, time } = data
            // setModelsLocal(loadAndSaveModels(newModels))
            // setDuration(time)
          }
          const spinner =
            (!updatedAt && lastPostAt) ||
            updatedAt < lastPostAt ||
            (updatedAt &&
              !(
                get(data, 'newModels.rf', null) &&
                get(data, 'newModels.lg', null) &&
                get(data, 'newModels.knn', null)
              ))

          return (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper elevation={3} className={classes.root}>
                  <Grid
                    container
                    spacing={2}
                    direction="row"
                    justify="center"
                    alignItems="center"
                  >
                    <Grid item xs={4}>
                      <FormControlLabel
                        labelPlacement="start"
                        control={
                          <Slider
                            onChange={(e, val) => setTrainSplit(val)}
                            style={{ width: 300, margin: 5 }}
                            aria-labelledby="discrete-slider-custom"
                            valueLabelDisplay="off"
                            step={0.1}
                            marks={sliderMarks}
                            value={
                              typeof trainSplit === 'number' ? trainSplit : 0
                            }
                            min={0.1}
                            max={1}
                          />
                        }
                        label="Train data split:"
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <div className={classes.buttonSection}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={oversamplingOn}
                              onChange={e =>
                                setOversamplingOn(e.target.checked)
                              }
                              name="checkedB"
                              color="primary"
                            />
                          }
                          label="Oversampling"
                        />
                      </div>
                    </Grid>
                    <Grid item xs={4}>
                      <div className={classes.buttonSection}>
                        <Button
                          color="primary"
                          className={buttonClassname}
                          disabled={!!spinner}
                          onClick={() =>
                            postMessage({
                              allData: get(dataQ, 'addressFeatures.rows', []),
                              trainingData,
                              trainingDataPredictions,
                              testData,
                              testDataPrediction,
                              rfSettings,
                              lgSettings,
                              knnSettings,
                            })
                          }
                          variant="contained"
                        >
                          Train
                        </Button>
                      </div>
                    </Grid>
                  </Grid>
                  <Paper elevation={0} className={classes.paper}>
                    <CollapsibleTable
                      columns={[
                        { id: 'classifier', name: 'Classifier' },
                        { id: 'precision', name: 'Precision [0;1]' },
                        { id: 'recall', name: 'Recall [0;1]' },
                        { id: 'accuracy', name: 'Accuracy [0;1]' },
                        { id: 'duration', name: 'Duration (ms)' },
                      ]}
                      rows={[
                        {
                          id: 'idPrecision_rf',
                          classifier: {
                            value: 'Random forest',
                          },
                          precision: { value: ceil(stats.precision.rf, 4) },
                          recall: { value: ceil(stats.recall.rf, 4) },
                          accuracy: { value: ceil(stats.accuracy.rf, 4) },
                          duration: { value: duration.rf },
                        },
                        {
                          id: 'idPrecision_lg',
                          classifier: {
                            value: 'Logistik regression',
                          },
                          precision: { value: ceil(stats.precision.lg, 4) },
                          recall: { value: ceil(stats.recall.lg, 4) },
                          accuracy: { value: ceil(stats.accuracy.lg, 4) },
                          duration: { value: duration.lg },
                        },
                        {
                          id: 'idPrecision_KNN',
                          classifier: {
                            value: 'K-nearest neighbors',
                          },
                          precision: { value: ceil(stats.precision.knn, 4) },
                          recall: { value: ceil(stats.recall.knn, 4) },
                          accuracy: { value: ceil(stats.accuracy.knn, 4) },
                          duration: { value: duration.knn },
                        },
                        // {
                        //   id: 'idPrecision_NB',
                        //   classifier: {
                        //     value: 'Naive Bayes',
                        //   },
                        //   precision: { value: ceil(stats.precision.nb, 4) },
                        //   recall: { value: ceil(stats.recall.nb, 4) },
                        //   accuracy: { value: ceil(stats.accuracy.nb, 4) },
                        //   duration: { value: duration.nb },
                        // },
                      ]}
                      onSubmitRf={onSubmitRf}
                      onSubmitLg={onSubmitLg}
                      onSubmitKNN={onSubmitKNN}
                      rfSettings={rfSettings}
                      lgSettings={lgSettings}
                      knnSettings={knnSettings}
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
