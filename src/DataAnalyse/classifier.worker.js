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
    knnSettings,
  } = dataParsed
  let rfClassifierOpt = rfSettings
    ? rfSettings
    : {
        seed: undefined,
        maxFeatures: 0.7,
        replacement: false,
        nEstimators: 7,
        // useSampleBagging: true,
      }
  rfClassifierOpt = {
    seed:
      rfClassifierOpt.seed === undefined
        ? undefined
        : Number(rfClassifierOpt.seed),
    maxFeatures: Number(rfClassifierOpt.maxFeatures),
    replacement: rfClassifierOpt.replacement,
    nEstimators: Number(rfClassifierOpt.nEstimators),
  }
  let lgClassifierOpt = lgSettings
    ? lgSettings
    : {
        numSteps: 1500,
        learningRate: 55e-4,
      }
  lgClassifierOpt = {
    numSteps: Number(lgClassifierOpt.numSteps),
    learningRate: Number(lgClassifierOpt.learningRate),
  }
  let knnClassifierOpt = knnSettings
    ? knnSettings
    : {
        k: 3,
      }
  knnClassifierOpt = {
    k: Number(knnClassifierOpt.k),
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
  let start = new Date()
  const knn = new KNN(trainingData, trainingDataPredictions, knnClassifierOpt)
  time.knn = new Date() - start
  newModels.knn = knn
  postMessage(JSON.stringify({ newModels, time }))

  // start = new Date()
  // var gaussianNB = new GaussianNB()
  // gaussianNB.train(trainingData, trainingDataPredictions)
  // time.nb = new Date() - start
  // newModels.gaussianNB = gaussianNB
  // postMessage(JSON.stringify({ newModels, time }))

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
