// immutable-update - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function clone(o){ var r={}; for(var k in o) if(Object.prototype.hasOwnProperty.call(o,k)) r[k]=o[k]; return r; }
function benchmark(){ var state={a:1,b:2,c:3,nested:{x:1,y:2}}, acc=0; for(var i=0;i<60000;i++){ var next=clone(state); next.nested=clone(state.nested); next.a=i; next.nested.x=(state.nested.x+i)&1023; state=next; acc+=state.a+state.nested.x; } return acc; }


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
