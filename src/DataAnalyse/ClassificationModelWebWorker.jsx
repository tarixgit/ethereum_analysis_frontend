import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import PropTypes from 'prop-types'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { map, get, takeRight, take, shuffle, truncate, compact } from 'lodash'
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
import Table from '../components/Table'
import { ModelContext } from '../App'

const myWorker = new Worker('./worker.js', { type: 'module' }) // relative path to the source file, not the public URL

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
}))

const loadAndSaveModels = memoizeOne(newModels => {
  const rf = RFClassifier.load(newModels.rf)
  const lg = LogisticRegression.load(newModels.lg)
  const knn = KNN.load(newModels.knn)
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

const calcErrorRate = (predicted, predictedMustBe) => {
  const isCorrect = map(predicted, (x, index) => x === predictedMustBe[index])
  const correctNumber = compact(isCorrect)
  return correctNumber.length / isCorrect.length
}

const checkAccuracy = (models, testData, testDataPrediction) => {
  const { lg, rf, knn } = models
  const predicted = rf.predict(testData)
  const predictedLogreg = lg.predict(new Matrix(testData))
  const predictedKNN = knn.predict(testData)
  const precisionRf = calcErrorRate(predicted, testDataPrediction)
  const precisionLR = calcErrorRate(predictedLogreg, testDataPrediction)
  const precisionKNN = calcErrorRate(predictedKNN, testDataPrediction)
  return { precisionRf, precisionLR, precisionKNN }
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
  })

  const { data, loading: loadingApi, networkStatus } = useQuery(
    LOAD_ADDRESS_FEATURES,
    {
      variables: { offset: 0, limit: 0 },
    }
  )
  const rows = get(data, 'addressFeatures.rows', [])
  if (!loadingApi && networkStatus === 7 && !trainingData) {
    const rowsShuffled = shuffle(rows)
    const fullSet = fitAndGetFeatures(rowsShuffled)
    // separate train and test data
    const fullPredictions = map(rowsShuffled, ({ scam }) => (scam ? 1 : 0))
    setTrainingData(take(fullSet, rows.length * 0.9))
    setTrainingDataPredictions(take(fullPredictions, rows.length * 0.9))
    setTestData(takeRight(fullSet, rows.length * 0.1))
    setTestDataPrediction(takeRight(fullPredictions, rows.length * 0.1))
  }
  useEffect(() => {
    if (trainingData) {
      const { lg, rf, knn } = modelsLocal
      if (lg && rf && knn) {
        setPrecision(checkAccuracy(modelsLocal, testData, testDataPrediction))
        setModels(modelsLocal)
      }
    }
  }, [newModelsJSON, trainingData])

  // useEffect(() => {
  //   return () => {
  //     myWorker.terminate()
  //     // myWorker = undefined
  //   }
  // }, [])

  return (
    <Fragment>
      <WebWorker
        // url="/worker.js"
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
            <Paper elevation={3} className={classes.root}>
              <div className={classes.buttonSection}>
                <Button
                  color="primary"
                  className={buttonClassname}
                  disabled={spinner}
                  onClick={() =>
                    postMessage({ trainingData, trainingDataPredictions })
                  }
                  variant="contained"
                >
                  Train
                </Button>
              </div>

              <Paper elevation={0} className={classes.paper}>
                <div>Output:</div>
                <Table
                  columns={['name', 'precision']}
                  rows={[
                    {
                      id: 'idPrecision_1',
                      name: {
                        value: 'Random forest',
                      },
                      precision: { value: precision.precisionRf },
                      error: { value: '0.9' },
                    },
                    {
                      id: 'idPrecision_2',
                      name: {
                        value: 'Logistik regression',
                      },
                      precision: { value: precision.precisionLR },
                      error: { value: '0.9' },
                    },

                    {
                      id: 'idPrecision_3',
                      name: {
                        value: 'K-nearest neighbors',
                      },
                      precision: { value: precision.precisionKNN },
                      error: { value: '0.9' },
                    },
                  ]}
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
          )
        }}
      </WebWorker>
    </Fragment>
  )
}

export default ClassificationModelWebWorker
