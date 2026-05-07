// exceptions - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function mayThrow(i){ if ((i & 15) === 0) throw new Error('x' + i); return i * 3; }
function benchmark() {
  var acc = 0;
  for (var i=0;i<70000;i++) {
    try { acc += mayThrow(i); } catch(e) { acc += e.message.length; }
  }
  return acc;
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
