// observable-stream - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function benchmark(){
  var acc=0;
  function map(arr, f){ var out=[]; for(var i=0;i<arr.length;i++) out.push(f(arr[i])); return out; }
  function filter(arr, f){ var out=[]; for(var i=0;i<arr.length;i++) if(f(arr[i])) out.push(arr[i]); return out; }
  var data=[]; for(var i=0;i<2000;i++) data[i]=i;
  for(var r=0;r<120;r++){ var a=map(data,function(x){return (x+r)*3;}); var b=filter(a,function(x){return (x&7)!==0;}); for(i=0;i<b.length;i+=13) acc+=b[i]&255; }
  return acc;
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
