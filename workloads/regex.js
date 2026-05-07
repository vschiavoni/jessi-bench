var N = 20; // iterations
var str = " for (var i = 0; i < 100; i++) { console.log(i) } // comment";

function benchmark() {
  var match;
  for (var i = 0; i < N; ++i) {
    var regex = /for\s*\(\s*(.+)\s*;\s*(.+)\s*;\s*(.+)\s*\)\s*\{\s*(\S+)\s*}/;
    match = str.match(regex);
  }
  return match && match[4] === "console.log(i)" ? 1 : 0;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  if (typeof console !== "undefined" && console.log) console.log(result === 1);
  console.log(Date.now() - startTime);
}
