import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import { get } from 'lodash'
import Button from '@material-ui/core/Button'
import { useLazyQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import TextField from '@material-ui/core/TextField'
import { Matrix } from 'ml-matrix' // "ml-matrix": "5.3.0",
import { fitAndGetFeature } from '../DataAnalyse/ClassificationModel'
import { ConfMatrix, ModelContext, StepContext } from '../App'
import Link from '@material-ui/core/Link'
import { useHistory } from 'react-router-dom'

const LOAD_ADDRESS_FEATURE = gql`
  query GetAndCalculateAddressFeatures($address: String!) {
    getAndCalculateAddressFeatures(address: $address) {
      hash
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

const ClassificationModel = (callback, deps) => {
  const classes = useStyles()
  const history = useHistory()
  const { models } = useContext(ModelContext)
  const { confusionMatrix } = useContext(ConfMatrix)
  const { step, setStep } = useContext(StepContext)
  const { lg, rf, knn, gaussianNB, stats } = models
  const [address, setAddress] = useState(
    '0xee18e156a020f2b2b2dcdec3a9476e61fbde1e48'
  )

  // 3 Classifier
  const [rfResult, setRfResult] = useState('')
  const [logregResult, setLogregResult] = useState('')
  const [KNNResult, setKNNResult] = useState('')
  const [NBResult, setNBResult] = useState('')

  const [
    loadAddressFeature,
    { data, loading, networkStatus, called },
  ] = useLazyQuery(LOAD_ADDRESS_FEATURE)
  const addressInfo = get(data, 'getAndCalculateAddressFeatures', null)
  const goToTrainModels = useCallback(() => {
    if (step !== 2) {
      setStep(2)
      history.push('/class')
    }
  }, [history])
  const changeAddress = useCallback(
    e => {
      const { value } = e.target
      setAddress(value)
    },
    [setAddress]
  )
  const loadAddressInfo = useCallback(
    () => loadAddressFeature({ variables: { address: address.toLowerCase() } }),
    [loadAddressFeature, address]
  )
  const getTruePositiveRate = ({ truePositive, falseNegative }) =>
    Math.round((truePositive / (truePositive + falseNegative)) * 100)
  const getTrueNegativeRate = ({ trueNegative, falsePositive }) =>
    Math.round((trueNegative / (trueNegative + falsePositive)) * 100)
  useEffect(() => {
    if (networkStatus === 7 && called) {
      const addressFeature = [fitAndGetFeature(addressInfo)]
      const rfResult = rf.predict(addressFeature)
      const predictedLogreg = lg.predict(new Matrix(addressFeature))
      const predictedKNN = knn.predict(addressFeature)
      const predictedNB = gaussianNB.predict(addressFeature)
      setRfResult(
        rfResult[0] === 1
          ? `Scam: with the probability ${getTruePositiveRate(
              confusionMatrix.rf
            )}%`
          : `Not scam: with the probability ${getTrueNegativeRate(
              confusionMatrix.rf
            )}%`
      )
      setLogregResult(
        predictedLogreg[0] === 1
          ? `Scam: with the probability ${getTruePositiveRate(
              confusionMatrix.lg
            )}% this address is a scam`
          : `Not scam: with the probability ${getTrueNegativeRate(
              confusionMatrix.lg
            )}%`
      )
      setKNNResult(
        predictedKNN[0] === 1
          ? `Scam: with the probability ${getTruePositiveRate(
              confusionMatrix.knn
            )}%`
          : `Not scam: with the probability ${getTrueNegativeRate(
              confusionMatrix.knn
            )}%`
      )
      setNBResult(
        predictedNB[0] >= 0.5
          ? `Scam: with the probability ${getTruePositiveRate(
              confusionMatrix.nb
            )}%`
          : `Not scam: with the probability ${getTrueNegativeRate(
              confusionMatrix.nb
            )}%`
      )
    }
  }, [addressInfo])

  const noModels = !lg || !rf || !knn
  return (
    <Fragment>
      <Paper elevation={3} className={classes.root}>
        <Paper elevation={0} className={classes.paper}>
          <div>
            <form onSubmit={loadAddressInfo}>
              <TextField
                id="address-input"
                label="Address"
                autoFocus
                fullWidth
                value={address}
                onChange={changeAddress}
              />
            </form>
            <Button
              variant="contained"
              color="primary"
              disabled={noModels}
              onClick={loadAddressInfo}
            >
              Check Address
            </Button>
            {noModels && (
              <span>
                The models are not trained please do this on{' '}
                <Link href="#" onClick={goToTrainModels}>
                  models
                </Link>{' '}
                page
              </span>
            )}
          </div>
          <div>Output:</div>
          <div>
            <TextField
              id="address-input"
              label="Result of random forest classifier"
              fullWidth
              disableUnderline
              value={rfResult}
            />
          </div>
          <div>
            <TextField
              id="address-input"
              label="Result of logistik regression classifier"
              fullWidth
              disableUnderline
              value={logregResult}
            />
          </div>
          <div>
            <TextField
              id="address-input"
              label="Result of k-nearest neighbors classifier"
              fullWidth
              disableUnderline
              value={KNNResult}
            />
          </div>
          <div>
            <TextField
              id="address-input"
              label="Result of naive Bayes classifier"
              fullWidth
              disableUnderline
              value={NBResult}
            />
          </div>
        </Paper>
      </Paper>
    </Fragment>
  )
}

export default ClassificationModel
