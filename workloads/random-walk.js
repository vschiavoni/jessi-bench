// random-walk - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function benchmark(){ var x=0,y=0,seed=1234567,acc=0; for(var i=0;i<800000;i++){ seed=(seed*1103515245+12345)&0x7fffffff; var d=seed&3; if(d===0)x++; else if(d===1)x--; else if(d===2)y++; else y--; acc += (x*x + y*y) & 255; } return acc; }


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
