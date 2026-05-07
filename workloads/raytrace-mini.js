// raytrace-mini - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function dot(a,b){return a.x*b.x+a.y*b.y+a.z*b.z;} function sub(a,b){return {x:a.x-b.x,y:a.y-b.y,z:a.z-b.z};}
function benchmark(){
  var spheres=[{c:{x:0,y:0,z:3},r:1},{c:{x:1.5,y:0,z:4},r:1},{c:{x:-1,y:.5,z:2.5},r:.5}], acc=0;
  for(var y=-40;y<40;y++) for(var x=-40;x<40;x++){
    var dir={x:x/40,y:y/40,z:1}, best=1e9;
    for(var i=0;i<spheres.length;i++){ var oc=sub({x:0,y:0,z:0},spheres[i].c); var b=2*dot(oc,dir); var c=dot(oc,oc)-spheres[i].r*spheres[i].r; var disc=b*b-4*c; if(disc>0){ var t=(-b-Math.sqrt(disc))/2; if(t>0&&t<best) best=t; } }
    if(best<1e9) acc += 255/(1+best);
  }
  return Math.floor(acc);
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
