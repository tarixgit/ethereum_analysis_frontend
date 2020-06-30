import {
  RandomForestClassifier as RFClassifier,
  RandomForestRegression as RFRegression,
} from 'ml-random-forest'
import LogisticRegression from 'ml-logistic-regression'
import { Matrix } from 'ml-matrix' //"ml-matrix": "5.3.0",
import KNN from 'ml-knn'
import { GaussianNB } from 'ml-naivebayes'

var dataset = [
  [73, 80, 75, 1.52, 0],
  [93, 88, 93, 1.85, 1],
  [89, 91, 90, 18.0, 0],
  [96, 98, 100, 19.6, 0],
  [73, 66, 70, 1.42, 1],
  [53, 46, 55, 10.1, 1],
  [69, 74, 77, 14.9, 0],
  [47, 56, 60, 1.15, 0],
  [87, 79, 90, 17.5, 1],
  [79, 70, 88, 16.4, 0],
  [69, 70, 73, 14.1, 0],
  [70, 65, 74, 14.1, 1],
  [93, 95, 91, 1.84, 0],
  [79, 80, 73, 15.2, 1],
  [70, 73, 78, 14.8, 1],
  [93, 89, 96, 1.92, 1],
  [78, 75, 68, 14.7, 1],
  [81, 90, 93, 18.3, 0],
  [88, 92, 86, 17.7, 0],
  [78, 83, 77, 15.9, 1],
  [82, 86, 90, 17.7, 1],
  [86, 82, 89, 1.75, 0],
  [78, 83, 85, 17.5, 0],
  [76, 83, 71, 1.9, 1],
  [96, 93, 95, 19.0, 0],
]

var trainingSet = new Array(dataset.length)
var predictions = new Array(dataset.length)

for (var i = 0; i < dataset.length; ++i) {
  trainingSet[i] = dataset[i].slice(0, 4)
  predictions[i] = dataset[i][4]
}

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

  // const trainingDataPredictions2 = trainingDataPredictions.map(p =>
  //   p ? 1 : -1
  // )
  var regression = new RFRegression(options)
  regression.train(trainingData, trainingDataPredictions)
  console.log(regression)

  var gaussianNB = new GaussianNB()
  gaussianNB.train(trainingData, trainingDataPredictions)
  // var predictions1 = model1.predict(trainingSet)
  console.log(gaussianNB)

  const newClassifierRF = new RFClassifier(rfClassifierOpt)
  newClassifierRF.train(trainingData, trainingDataPredictions)

  const X = new Matrix(trainingData)
  const Y = Matrix.columnVector(trainingDataPredictions)
  const logreg = new LogisticRegression(lgClassifierOpt)
  logreg.train(X, Y)

  const knn = new KNN(trainingData, trainingDataPredictions)
  const newModels = {
    lg: logreg,
    rf: newClassifierRF,
    knn,
    gaussianNB,
    regression,
  }

  console.log('Posting message back to main script')
  postMessage(JSON.stringify({ newModels }))
}
