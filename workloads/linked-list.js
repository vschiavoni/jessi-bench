// linked-list - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function benchmark() {
  var head = null;
  for (var i=0;i<25000;i++) head = { value: i, next: head };
  var acc = 0;
  for (var r=0;r<50;r++) { var p=head; while(p) { acc = (acc + ((p.value ^ r) & 255)) & 0x7fffffff; p=p.next; } }
  return acc;
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
