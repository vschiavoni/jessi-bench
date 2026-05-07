// async-await-compatible - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function benchmark() {
  // ES5-compatible async-state-machine style workload, rather than literal async/await syntax.
  var state = 0, value = 0, steps = 60000;
  for (var i=0;i<steps;i++) {
    switch (state) {
      case 0: value = (value + i) & 0xfffffff; state = 1; break;
      case 1: value = (value ^ (i * 31)) & 0xfffffff; state = 2; break;
      case 2: value = (value + (value >>> 3)) & 0xfffffff; state = 0; break;
    }
  }
  return value;
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
