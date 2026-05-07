var N = 20; // iterations
var S = 1e4; // array size
var array = [];
for (var i = 0; i < S; i++) array.push(i);

function benchmark() {
  var res;
  var checksum = 0;
  for (var i = 0; i < N; ++i) {
    res = array.slice(i * (S / N));
    checksum += res.length;
  }
  return checksum;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  if (typeof console !== "undefined" && console.log) console.log(result);
  console.log(Date.now() - startTime);
}
