// destructuring-spread-compatible - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function copyArray(a){ var b = new Array(a.length); for (var i=0;i<a.length;i++) b[i]=a[i]; return b; }
function copyObject(o){ var r={}; for (var k in o) if (Object.prototype.hasOwnProperty.call(o,k)) r[k]=o[k]; return r; }
function benchmark() {
  var acc=0, base={a:1,b:2,c:3,d:4};
  var arr=[1,2,3,4,5,6,7,8];
  for (var i=0;i<60000;i++) {
    var o=copyObject(base); o.x=i; o.y=i&7;
    var a=copyArray(arr); a[a.length]=i&15;
    acc += o.a + o.y + a[2] + a[a.length-1];
  }
  return acc;
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
