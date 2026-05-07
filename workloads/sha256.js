// sha256-lite - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function benchmark(){ var h=0x811c9dc5; for(var r=0;r<1500;r++){ var s='security workload message '+r+' '+h; for(var i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = (h + ((h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24))) | 0; } } return h>>>0; }


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
