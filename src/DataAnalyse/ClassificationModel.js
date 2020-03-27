import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import { map, get, truncate, compact } from 'lodash'
import Button from '@material-ui/core/Button'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import TextField from '@material-ui/core/TextField'
import { RandomForestClassifier as RFClassifier } from 'ml-random-forest'
import { RandomForestRegression as RFRegression } from 'ml-random-forest'
import LogisticRegression from 'ml-logistic-regression'
import { Matrix } from 'ml-matrix'
import KNN from 'ml-knn'

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
        numberOfTransaction
        medianOfEthProTrans
        averageOfEthProTrans
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
  seed: 3,
  maxFeatures: 0.8,
  replacement: true,
  nEstimators: 25,
}

const regressionOptions = {
  seed: 3,
  maxFeatures: 2,
  replacement: false,
  nEstimators: 200,
}

const ClassificationModel = (callback, deps) => {
  const classes = useStyles()
  const [address, setAddress] = useState(
    '0xee18e156a020f2b2b2dcdec3a9476e61fbde1e48'
  )
  const [classifier, setClassifier] = useState(null)
  const [regression, setRegression] = useState(null)
  const [knn, setKNN] = useState(null)
  const [output, setOutput] = useState(null)
  const [result, setResult] = useState('')
  const [regressionResult, setRegressionResult] = useState('')
  const [knnResult, setKnnResult] = useState('')

  const { data, loading } = useQuery(LOAD_ADDRESS_FEATURES, {
    variables: { offset: 0, limit: 10000 },
  })
  const rows = get(data, 'addressFeatures.rows', [])
  //const count = get(data, 'addressFeatures.count', -1)
  const changeAddress = e => {
    const { value } = e.target
    setAddress(value)
  }

  const buildModels = useCallback(() => {
    const trainingSet = map(
      rows,
      ({
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
      }) => [
        numberOfNone || 0,
        numberOfOneTime || 0,
        numberOfExchange || 0,
        numberOfMiningPool || 0,
        numberOfMiner || 0,
        numberOfSmContract || 0,
        numberOfERC20 || 0,
        numberOfERC721 || 0,
        numberOfTrace || 0,
        medianOfEthProTrans || 0,
        averageOfEthProTrans || 0,
      ]
    )
    const predictions = map(rows, ({ scam }) => (scam ? 1 : 0))
    const newClassifierRF = new RFClassifier(options)
    newClassifierRF.train(trainingSet, predictions)
    // const newRegressionRf = new RFRegression(regressionOptions)
    // newRegressionRf.train(trainingSet, predictions)
    setClassifier(newClassifierRF)
    // setRegression(newRegressionRf)
    // const logreg = new LogisticRegression({
    //   numSteps: 1000,
    //   learningRate: 5e-3,
    // })
    // const X = new Matrix(trainingSet)
    // const Y = Matrix.columnVector(predictions)
    // logreg.train(X, Y)
    // setRegression(logreg)
    const knn = new KNN(trainingSet, predictions)
    setKNN(knn)
  }, [rows])

  const checkAddress = useCallback(() => {
    // TODO API call to build new feature for new address
    const testData = [
      [1, 1, 2, 0, 0, 0, 0, 0, 0, 0.766776805, 0.766619305],
      [855, 10, 46, 39, 116, 0, 0, 0, 0, 1, 4.05057682316517],
    ]
    const expected = [1, 0]
    setResult(classifier.predict(testData))
    setKnnResult(knn.predict(testData))
  }, [classifier])
  return (
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
          <form onSubmit={checkAddress}>
            <TextField
              id="address-input"
              label="Address"
              autoFocus
              fullWidth
              value={address}
              onChange={changeAddress}
            />
          </form>
          <Button variant="contained" color="primary" onClick={checkAddress}>
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
  )
}

export default ClassificationModel
