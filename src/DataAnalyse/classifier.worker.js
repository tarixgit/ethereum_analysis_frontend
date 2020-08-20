import {
  RandomForestClassifier as RFClassifier,
  RandomForestRegression as RFRegression,
} from 'ml-random-forest'
import LogisticRegression from 'ml-logistic-regression'
import { Matrix } from 'ml-matrix' //"ml-matrix": "5.3.0",
import KNN from 'ml-knn'
import { GaussianNB } from 'ml-naivebayes'
import { compact, filter, map, random, shuffle, take, takeRight } from 'lodash'
import normed from 'ml-array-normed'

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
// const options = {
//   seed: 3, // for random function(MersenneTwister) for bagging
//   maxFeatures: 0.8, // part of features used for bagging
//   replacement: true, // for bagging
//   nEstimators: 25,
// }
// todo needed useSampleBagging to true - hillft gegen overfiting, default false
// featureBagging always run, cause we have nEstimators

onmessage = function(e) {
  console.log('Message received from main script')
  const dataParsed = JSON.parse(e.data)
  const {
    allData,
    trainingData,
    trainingDataPredictions,
    rfSettings,
    lgSettings,
    knnSettings,
  } = dataParsed
  const rfStatsArray = []
  const lgStatsArray = []
  const knnStatsArray = []
  for (let kl = 1; kl < 3; kl++) {
    const rowsShuffled = oversampling(allData)
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

    const split = 0.8
    const trainingData = take(fullSet, rowsShuffled.length * split)
    const trainingDataPredictions = take(
      fullPredictions,
      rowsShuffled.length * split
    )

    const testData = takeRight(fullSet, rowsShuffled.length * (1 - split))
    const testDataPrediction = takeRight(
      fullPredictions,
      rowsShuffled.length * (1 - split)
    )
    console.log('started')
    console.log(testData)
    console.log(testData[0])
    console.log(testDataPrediction)
    const newModels = startFunc(
      trainingData,
      trainingDataPredictions,
      rfSettings,
      lgSettings,
      knnSettings
    )
    console.log('finished')
    const fullConMatrix = checkAccuracy(newModels, testData, testDataPrediction)
    const currentStats = calcStats(fullConMatrix)
    rfStatsArray.push([
      currentStats.precision.rf,
      currentStats.recall.rf,
      currentStats.accuracy.rf,
    ])
    lgStatsArray.push([
      currentStats.precision.lg,
      currentStats.recall.lg,
      currentStats.accuracy.lg,
    ])
    knnStatsArray.push([
      currentStats.precision.knn,
      currentStats.recall.knn,
      currentStats.accuracy.knn,
    ])
  }

  console.log('Posting message back to main script')
  postMessage(
    JSON.stringify({
      rfStatsArray,
      lgStatsArray,
      knnStatsArray,
      //newModels,
      //time,
    })
  )
}

const startFunc = (
  trainingData,
  trainingDataPredictions,
  rfSettings,
  lgSettings,
  knnSettings
) => {
  let rfClassifierOpt = {
    seed: undefined,
    maxFeatures: 0.7,
    replacement: false,
    nEstimators: 7,
    // useSampleBagging: true,
  }
  let lgClassifierOpt = {
    numSteps: 1500,
    learningRate: 55e-4,
  }

  let knnClassifierOpt = {
    k: 3,
  }
  // var regression = new RFRegression(options)
  // regression.train(trainingData, trainingDataPredictions)
  const newModels = {
    lg: null,
    rf: null,
    knn: null,
    gaussianNB: null,
    regression: null,
  }
  const time = {
    lg: null,
    rf: null,
    knn: null,
    nb: null,
  }
  console.log('one')
  let start = new Date()
  const knn = new KNN(trainingData, trainingDataPredictions, knnClassifierOpt)
  time.knn = new Date() - start
  newModels.knn = knn
  // postMessage(JSON.stringify({ newModels, time }))

  // start = new Date()
  // var gaussianNB = new GaussianNB()
  // gaussianNB.train(trainingData, trainingDataPredictions)
  // time.nb = new Date() - start
  // newModels.gaussianNB = gaussianNB
  // postMessage(JSON.stringify({ newModels, time }))

  start = new Date()
  console.log('two')
  const newClassifierRF = new RFClassifier(rfClassifierOpt)
  newClassifierRF.train(trainingData, trainingDataPredictions)
  time.rf = new Date() - start
  newModels.rf = newClassifierRF
  // postMessage(JSON.stringify({ newModels, time }))
  console.log('three')
  start = new Date()
  const X = new Matrix(trainingData)
  const Y = Matrix.columnVector(trainingDataPredictions)
  const logreg = new LogisticRegression(lgClassifierOpt)
  logreg.train(X, Y)
  time.lg = new Date() - start
  newModels.lg = logreg
  console.log('three')
  return newModels
}

const features = ['sepal_length', 'sepal_width', 'petal_length', 'petal_width']

const s = (rf, num_features) => {
  //EVALUATE FEATURE IMPORTANCE FOR EACH TREE IN THE ENSEMBLE
  const trees = JSON.parse(JSON.stringify(rf.estimators))
  const indexes = JSON.parse(JSON.stringify(rf.indexes))
  let importance = []

  function compute_feature_importances(i, node) {
    if (!node || !('splitColumn' in node) || !(node.gain > 0)) return
    let f = node.gain * node.samples
    if ('left' in node) f -= (node.left.gain || 0) * (node.left.samples || 0)
    if ('right' in node) f -= (node.right.gain || 0) * (node.right.samples || 0)
    importance[i][node.splitColumn] += f
    if (!!node.left) compute_feature_importances(i, node.left)
    if (!!node.right) compute_feature_importances(i, node.right)
  }

  function normalize_importance(i) {
    const s = importance[i].reduce((cum, v) => {
      return (cum += v)
    }, 0)
    importance[i] = importance[i].map(v => {
      return v / s
    })
  }

  for (let i = 0; i < trees.length; i++) {
    importance.push(new Array(num_features).fill(0.0))
    compute_feature_importances(i, trees[i].root)
    normalize_importance(i)
  }

  let avg_importance = new Array(num_features).fill(0.0)
  //CALCULATE MEAN
  for (let i = 0; i < importance.length; i++) {
    for (let x = 0; x < num_features; x++) {
      avg_importance[indexes[i][x]] += importance[i][x]
    }
  }
  const s = avg_importance.reduce((cum, v) => {
    return (cum += v)
  }, 0)
  return avg_importance.map(v => {
    return v / s
  })
}
