var N = 3; // iterations

function NanoNeuron(w, b) {
  this.w = w;
  this.b = b;
  this.predict = function (x) { return x * this.w + this.b; };
}

function celsiusToFahrenheit(c) {
  return c * 1.8 + 32;
}

function generateDataSets() {
  var xTrain = [];
  var yTrain = [];
  for (var x = 0; x < 100; x += 1) {
    xTrain.push(x);
    yTrain.push(celsiusToFahrenheit(x));
  }
  var xTest = [];
  var yTest = [];
  for (var xt = 0.5; xt < 100; xt += 1) {
    xTest.push(xt);
    yTest.push(celsiusToFahrenheit(xt));
  }
  return [xTrain, yTrain, xTest, yTest];
}

function predictionCost(y, prediction) {
  return Math.pow(y - prediction, 2) / 2;
}

function forwardPropagation(model, xTrain, yTrain) {
  var m = xTrain.length;
  var predictions = [];
  var cost = 0;
  for (var i = 0; i < m; i += 1) {
    var prediction = model.predict(xTrain[i]);
    cost += predictionCost(yTrain[i], prediction);
    predictions.push(prediction);
  }
  cost /= m;
  return [predictions, cost];
}

function backwardPropagation(predictions, xTrain, yTrain) {
  var m = xTrain.length;
  var dW = 0;
  var dB = 0;
  for (var i = 0; i < m; i += 1) {
    dW += (yTrain[i] - predictions[i]) * xTrain[i];
    dB += yTrain[i] - predictions[i];
  }
  dW /= m;
  dB /= m;
  return [dW, dB];
}

function trainModel(model, epochs, alpha, xTrain, yTrain) {
  var lastCost = 0;
  for (var epoch = 0; epoch < epochs; epoch += 1) {
    var predCost = forwardPropagation(model, xTrain, yTrain);
    var predictions = predCost[0];
    lastCost = predCost[1];
    var dWdB = backwardPropagation(predictions, xTrain, yTrain);
    model.w += alpha * dWdB[0];
    model.b += alpha * dWdB[1];
  }
  return lastCost;
}

function benchmark() {
  var dataSets = generateDataSets();
  var xTrain = dataSets[0];
  var yTrain = dataSets[1];
  var xTest = dataSets[2];
  var yTest = dataSets[3];
  var customPrediction = 0;
  for (var i = 0; i < N; i++) {
    var nanoNeuron = new NanoNeuron(0.5, 0.5);
    trainModel(nanoNeuron, 70000, 0.0005, xTrain, yTrain);
    forwardPropagation(nanoNeuron, xTest, yTest)[1];
    customPrediction = nanoNeuron.predict(70);
  }
  return customPrediction;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  if (typeof console !== "undefined" && console.log) console.log(result);
  console.log(Date.now() - startTime);
}
