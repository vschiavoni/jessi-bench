// merkle-proof-batch - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function hash(s){ var h=2166136261; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=(h+((h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24)))>>>0; } return h.toString(16); }
function benchmark(){ var leaves=[],acc=0,i; for(i=0;i<512;i++) leaves[i]=hash('leaf-'+i); var level=leaves; while(level.length>1){ var next=[]; for(i=0;i<level.length;i+=2) next.push(hash(level[i]+(level[i+1]||level[i]))); level=next; acc+=level.length; } var root=level[0]; for(i=0;i<4000;i++) acc += hash(root+i).charCodeAt(i&7); return acc; }


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
