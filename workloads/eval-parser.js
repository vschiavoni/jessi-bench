// eval-parser - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function tinyEval(expr) { return eval(expr); }
function benchmark() {
  if (typeof eval !== 'function') return 0;
  var acc = 0;
  for (var i=0;i<1500;i++) {
    acc += tinyEval('(' + (i%97) + '+' + ((i*3)%101) + ')*' + ((i%13)+1));
  }
  return acc;
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
