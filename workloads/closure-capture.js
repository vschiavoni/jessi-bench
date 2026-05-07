// closure-capture - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function makeAdder(a,b){ return function(x){ return (x + a) * b; }; }
function benchmark() {
  var funcs = [], i, acc = 0;
  for (i=0;i<2000;i++) funcs[i] = makeAdder(i & 31, (i % 7) + 1);
  for (var r=0;r<80;r++) for (i=0;i<funcs.length;i+=3) acc = (acc + funcs[i](r)) & 0x7fffffff;
  return acc;
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
