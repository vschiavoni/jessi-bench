// matrix-multiply - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function makeMatrix(n, seed) {
  var a = new Array(n*n);
  var x = seed;
  for (var i=0;i<a.length;i++) { x = (x * 1103515245 + 12345) & 0x7fffffff; a[i] = (x % 1000) / 1000; }
  return a;
}
function benchmark() {
  var n = 24, rounds = 18, checksum = 0;
  var A = makeMatrix(n, 7), B = makeMatrix(n, 13), C = new Array(n*n);
  for (var r=0;r<rounds;r++) {
    for (var i=0;i<n;i++) for (var j=0;j<n;j++) {
      var sum = 0;
      for (var k=0;k<n;k++) sum += A[i*n+k] * B[k*n+j];
      C[i*n+j] = sum;
    }
    var tmp=A; A=B; B=C; C=tmp;
    checksum += B[(r*17)%(n*n)];
  }
  return Math.floor(checksum * 1000000);
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
