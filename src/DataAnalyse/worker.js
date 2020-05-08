import { RandomForestClassifier as RFClassifier } from 'ml-random-forest'
import LogisticRegression from 'ml-logistic-regression'
import { Matrix } from 'ml-matrix' //"ml-matrix": "5.3.0",
import KNN from 'ml-knn'

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
  const workerResult = 'Result: ' + e.data
  const dataParsed = JSON.parse(e.data)
  const { trainingData, trainingDataPredictions } = dataParsed
  const newClassifierRF = new RFClassifier(options)
  newClassifierRF.train(trainingData, trainingDataPredictions)

  const X = new Matrix(trainingData)
  const Y = Matrix.columnVector(trainingDataPredictions)
  const logreg = new LogisticRegression({
    numSteps: 1000,
    learningRate: 5e-3,
  })
  logreg.train(X, Y)

  const knn = new KNN(trainingData, trainingDataPredictions)
  const newModels = {
    lg: logreg,
    rf: newClassifierRF,
    knn,
  }

  console.log('Posting message back to main script')
  postMessage(JSON.stringify({ newModels }))
}
