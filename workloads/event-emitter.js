// event-emitter - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function Emitter(){ this.handlers={}; }
Emitter.prototype.on=function(e,f){ (this.handlers[e]||(this.handlers[e]=[])).push(f); };
Emitter.prototype.emit=function(e,a,b){ var hs=this.handlers[e]||[], acc=0; for(var i=0;i<hs.length;i++) acc += hs[i](a,b); return acc; };
function benchmark(){ var em=new Emitter(), acc=0; for(var i=0;i<80;i++) em.on('evt'+(i%7), (function(k){return function(a,b){return (a+b+k)&255;};})(i)); for(i=0;i<30000;i++) acc+=em.emit('evt'+(i%7), i, i>>>2); return acc; }


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
