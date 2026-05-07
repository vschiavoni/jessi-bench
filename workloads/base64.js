// base64 - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

var B64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function enc(bytes){ var out='',i; for(i=0;i<bytes.length;i+=3){ var a=bytes[i],b=bytes[i+1]||0,c=bytes[i+2]||0,n=(a<<16)|(b<<8)|c; out+=B64.charAt((n>>18)&63)+B64.charAt((n>>12)&63)+(i+1<bytes.length?B64.charAt((n>>6)&63):'=')+(i+2<bytes.length?B64.charAt(n&63):'='); } return out; }
function benchmark(){ var bytes=[],acc=0; for(var i=0;i<4096;i++) bytes[i]=(i*31+i*i)&255; for(var r=0;r<300;r++){ var s=enc(bytes); acc += s.charCodeAt((r*17)%s.length); } return acc; }


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
