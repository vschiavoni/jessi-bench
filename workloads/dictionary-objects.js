// dictionary-objects - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function benchmark() {
  var total = 0;
  var rounds = 180;
  for (var r = 0; r < rounds; r++) {
    var obj = {};
    var i;
    for (i = 0; i < 220; i++) obj['k' + ((i * 17 + r) % 317)] = i + r;
    for (i = 0; i < 180; i += 3) delete obj['k' + ((i * 17 + r) % 317)];
    for (i = 0; i < 250; i++) {
      var key = 'k' + ((i * 31 + r) % 317);
      if (obj[key] !== undefined) total += obj[key] & 255;
      else obj[key] = i ^ r;
    }
  }
  return total;
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
