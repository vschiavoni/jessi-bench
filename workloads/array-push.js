var N = 20; // iterations
var S = 1e3; // array size

function benchmark() {
  var res = 0;
  for (var i = 0; i < N; ++i) {
    var array = [];
    for (var j = 0; j < S; j++) array.push(i + j);
    res += array[0] + array[array.length - 1];
  }
  return res;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  if (typeof console !== "undefined" && console.log) console.log(result);
  console.log(Date.now() - startTime);
}
