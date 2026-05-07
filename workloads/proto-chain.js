var N = 20; // iterations
var D = 1e4; // chain depth

function benchmark() {
  var res = 0;
  for (var i = 0; i < N; ++i) {
    var obj = { prop: 12345 };
    for (var j = 0; j < D; ++j) {
      obj = Object.create(obj);
      res = obj.prop;
    }
  }
  return res;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  if (typeof console !== "undefined" && console.log) console.log(result);
  console.log(Date.now() - startTime);
}
