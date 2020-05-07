import React, { Fragment, useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import { map, get, takeRight, take, shuffle, truncate, compact } from 'lodash'
import Button from '@material-ui/core/Button'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import TextField from '@material-ui/core/TextField'
import { RandomForestClassifier as RFClassifier } from 'ml-random-forest'
// import { RandomForestRegression as RFRegression } from 'ml-random-forest'
import LogisticRegression from 'ml-logistic-regression'
import { Matrix } from 'ml-matrix' //"ml-matrix": "5.3.0",
import KNN from 'ml-knn'
import Table from '../components/Table'

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
  button: {
    padding: 0,
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}))

const options = {
  seed: 3, // for random function(MersenneTwister) for bagging
  maxFeatures: 0.8, // part of features used for bagging
  replacement: true, // for bagging
  nEstimators: 25,
}
// todo needed useSampleBagging to true - hillft gegen overfiting, default false
// featureBagging always run, cause we have nEstimators
const regressionOptions = {
  seed: 3,
  maxFeatures: 1,
  replacement: true,
  nEstimators: 1,
}

const fitAndGetFeatures = data => {
  return map(data, item => {
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
  })
}

const calcErrorRate = (predicted, predictedMustBe) => {
  console.log(predicted)
  const isCorrect = map(predicted, (x, index) => x === predictedMustBe[index])
  console.log(isCorrect)
  const correcrNumber = compact(isCorrect)
  console.log(correcrNumber.length / isCorrect.length)
}
const ClassificationModel = (callback, deps) => {
  const classes = useStyles()
  const [address, setAddress] = useState(
    '0xee18e156a020f2b2b2dcdec3a9476e61fbde1e48'
  )
  // 3 Classifier
  const [classifier, setClassifier] = useState(null)
  const [regression, setRegression] = useState(null)
  const [knn, setKNN] = useState(null)

  const [output, setOutput] = useState(null)
  const [result, setResult] = useState('')
  const [regressionResult, setRegressionResult] = useState('')
  const [knnResult, setKnnResult] = useState('')

  const { data, loading } = useQuery(LOAD_ADDRESS_FEATURES, {
    variables: { offset: 0, limit: 0 },
  })
  const rows = get(data, 'addressFeatures.rows', [])
  //const count = get(data, 'addressFeatures.count', -1)
  const changeAddress = useCallback(
    e => {
      const { value } = e.target
      setAddress(value)
    },
    [setAddress]
  )
  // todo maybe move out?
  const buildModels = useCallback(() => {
    const rowsShuffled = shuffle(rows)
    const fullSet = fitAndGetFeatures(rowsShuffled)
    // TODO check if ||0 still actual

    const fullPredictions = map(rowsShuffled, ({ scam }) => (scam ? 1 : 0))
    const trainingSet = take(fullSet, rows.length * 0.9)
    const trainingPredictions = take(fullPredictions, rows.length * 0.9)
    const newClassifierRF = new RFClassifier(options)
    newClassifierRF.train(trainingSet, trainingPredictions)

    const testData = takeRight(fullSet, rows.length * 0.1)
    const testDataPrediction = takeRight(fullPredictions, rows.length * 0.1)
    const predicted = newClassifierRF.predict(testData)

    calcErrorRate(predicted, testDataPrediction)
    setClassifier(newClassifierRF)

    // const newRegressionRf = new RFRegression(regressionOptions)
    // newRegressionRf.train(trainingSet, trainingPredictions)
    // const predictedRegression = newRegressionRf.predict(testData)
    // calcErrorRate(predictedRegression, testDataPrediction)
    // setRegression(newRegressionRf)

    const logreg = new LogisticRegression({
      numSteps: 1000,
      learningRate: 5e-3,
    })

    const X = new Matrix(trainingSet)
    const Y = Matrix.columnVector(trainingPredictions)
    logreg.train(X, Y)
    const predictedLogreg = logreg.predict(new Matrix(testData))
    calcErrorRate(predictedLogreg, testDataPrediction)
    setRegression(logreg)
    const knn = new KNN(trainingSet, trainingPredictions)
    setKNN(knn)
    const predictedKNN = knn.predict(testData)
    calcErrorRate(predictedKNN, testDataPrediction)
  }, [rows])

  // const checkAddress = useCallback(() => {
  //   // TODO API call to build new feature for new address
  //   setResult(classifier.predict(testData))
  //   setKnnResult(knn.predict(testData))
  // }, [classifier])
  return (
    <Fragment>
      <Paper elevation={3} className={classes.root}>
        <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <Button variant="contained" color="primary" onClick={buildModels}>
            Train
          </Button>
        </div>
        <Paper elevation={0} className={classes.paper}>
          <div>Output:</div>
          <div>{}</div>
          <div>
            <form onSubmit={() => {}}>
              <TextField
                id="address-input"
                label="Address"
                autoFocus
                fullWidth
                value={address}
                onChange={changeAddress}
              />
            </form>
            <Button variant="contained" color="primary" onClick={() => {}}>
              Check Address
            </Button>
          </div>
          <div>Output:</div>
          <div>
            <TextField
              id="address-input"
              label="Result of rf classifcier"
              fullWidth
              multiline
              rows="4"
              value={result}
            />
          </div>
          <div>
            <TextField
              id="address-input"
              label="Result of KNN"
              fullWidth
              multiline
              rows="4"
              value={knnResult}
            />
          </div>
          <div>
            <TextField
              id="address-input"
              label="Result of regression"
              fullWidth
              multiline
              rows="4"
              value={regressionResult}
            />
          </div>
        </Paper>
      </Paper>
    </Fragment>
  )
}

export default ClassificationModel

// accuracy
