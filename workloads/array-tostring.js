var N = 20; // iterations

function benchmark() {
  var res = {};
  var array = [];
  var checksum = 0;
  for (var i = 0; i < N; ++i) {
    if (i % 100 === 0) {
      res = {};
      array = [];
    }
    array.push(i);
    res[array] = -i;
    checksum += res[array];
  }
  return checksum;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  if (typeof console !== "undefined" && console.log) console.log(result);
  console.log(Date.now() - startTime);
}
