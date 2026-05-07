// bitops - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function benchmark() {
  var x = 0x12345678, y = 0x9abcdef0, acc = 0;
  for (var i=0;i<900000;i++) {
    x = ((x << 5) | (x >>> 27)) ^ (i * 2654435761);
    y = ((y >>> 3) | (y << 29)) + (x ^ i);
    acc ^= ((x & y) ^ (x | ~y)) + (x >>> (i & 15));
  }
  return acc >>> 0;
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
