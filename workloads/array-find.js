var N = 20; // iterations
var S = 1e4; // array size
var array = [];
for (var i = 0; i < S; i++) array.push("x" + i);
var val = "x" + Math.floor(S * 0.8);

function benchmark() {
  var res;
  for (var i = 0; i < N; ++i) {
    res = array[array.indexOf(val)];
  }
  return res ? res.length : 0;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  if (typeof console !== "undefined" && console.log) console.log(result);
  console.log(Date.now() - startTime);
}
