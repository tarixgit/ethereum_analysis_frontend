import {
  RandomForestClassifier as RFClassifier,
  RandomForestRegression as RFRegression,
} from 'ml-random-forest'
import LogisticRegression from 'ml-logistic-regression'
import { Matrix } from 'ml-matrix' //"ml-matrix": "5.3.0",
import KNN from 'ml-knn'
import { GaussianNB } from 'ml-naivebayes'

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
    trainingData,
    trainingDataPredictions,
    rfSettings,
    lgSettings,
  } = dataParsed
  let rfClassifierOpt = rfSettings ? rfSettings : options
  rfClassifierOpt = {
    seed: Number(rfClassifierOpt.seed),
    maxFeatures: Number(rfClassifierOpt.maxFeatures),
    replacement: rfClassifierOpt.replacement,
    nEstimators: Number(rfClassifierOpt.nEstimators),
  }
  let lgClassifierOpt = lgSettings
    ? lgSettings
    : {
        numSteps: 1000,
        learningRate: 5e-3,
      }
  lgClassifierOpt = {
    numSteps: Number(lgClassifierOpt.numSteps),
    learningRate: Number(lgClassifierOpt.learningRate),
  }

  var options = {
    seed: 42,
    maxFeatures: 1.0,
    replacement: true,
    nEstimators: 20,
    selectionMethod: 'median',
    useSampleBagging: true,
  }

  // var regression = new RFRegression(options)
  // regression.train(trainingData, trainingDataPredictions)
  // console.log(regression)
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
  let start = new Date()
  const knn = new KNN(trainingData, trainingDataPredictions)
  time.knn = new Date() - start
  newModels.knn = knn
  postMessage(JSON.stringify({ newModels, time }))

  start = new Date()
  var gaussianNB = new GaussianNB()
  gaussianNB.train(trainingData, trainingDataPredictions)
  time.nb = new Date() - start
  newModels.gaussianNB = gaussianNB
  postMessage(JSON.stringify({ newModels, time }))

  start = new Date()
  const newClassifierRF = new RFClassifier(rfClassifierOpt)
  newClassifierRF.train(trainingData, trainingDataPredictions)
  time.rf = new Date() - start
  newModels.rf = newClassifierRF
  postMessage(JSON.stringify({ newModels, time }))

  start = new Date()
  const X = new Matrix(trainingData)
  const Y = Matrix.columnVector(trainingDataPredictions)
  const logreg = new LogisticRegression(lgClassifierOpt)
  logreg.train(X, Y)
  time.lg = new Date() - start
  newModels.lg = logreg

  console.log('Posting message back to main script')
  postMessage(
    JSON.stringify({
      newModels,
      time,
    })
  )
}
