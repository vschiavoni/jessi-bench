// date-formatting - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function pad2(n){ return n < 10 ? '0' + n : '' + n; }
function fmt(d){ return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth()+1) + '-' + pad2(d.getUTCDate()) + 'T' + pad2(d.getUTCHours()) + ':' + pad2(d.getUTCMinutes()) + ':' + pad2(d.getUTCSeconds()) + 'Z'; }
function benchmark() {
  var acc = 0;
  for (var i=0;i<12000;i++) {
    var d = new Date(946684800000 + i * 86417000 + (i%97)*1000);
    var s = fmt(d);
    acc += s.charCodeAt(i % s.length);
  }
  return acc;
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
