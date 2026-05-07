// recursive-fib-memo - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function fib(n, memo){ if (memo[n] !== undefined) return memo[n]; return memo[n] = fib(n-1,memo) + fib(n-2,memo); }
function benchmark() {
  var acc = 0;
  for (var r=0;r<900;r++) { var memo = {0:0,1:1}; acc += fib(28 + (r%5), memo); }
  return acc;
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
