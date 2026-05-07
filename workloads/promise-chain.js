// promise-chain - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function fallbackChain(n) { var v=0; for (var i=0;i<n;i++) v = (v * 33 + i) & 0xfffffff; return v; }
function benchmark() {
  if (typeof Promise === 'undefined') return fallbackChain(25000);
  // Synchronous construction of promise chains; harness treats returned object as a sink.
  var p = Promise.resolve(0);
  for (var i=0;i<300;i++) p = p.then((function(k){ return function(v){ return (v + k) & 0xffff; }; })(i));
  return 300;
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
