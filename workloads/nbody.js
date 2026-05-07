// nbody - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function benchmark() {
  var n=32, steps=180, bodies=[], i,j;
  for(i=0;i<n;i++) bodies[i]={x:Math.sin(i),y:Math.cos(i),z:Math.sin(i*0.5),vx:0,vy:0,vz:0,m:1+(i%5)};
  for(var s=0;s<steps;s++){
    for(i=0;i<n;i++) for(j=i+1;j<n;j++){
      var dx=bodies[j].x-bodies[i].x, dy=bodies[j].y-bodies[i].y, dz=bodies[j].z-bodies[i].z;
      var d2=dx*dx+dy*dy+dz*dz+0.01, inv=1/Math.sqrt(d2*d2*d2), f=0.001*inv;
      bodies[i].vx+=dx*f*bodies[j].m; bodies[i].vy+=dy*f*bodies[j].m; bodies[i].vz+=dz*f*bodies[j].m;
      bodies[j].vx-=dx*f*bodies[i].m; bodies[j].vy-=dy*f*bodies[i].m; bodies[j].vz-=dz*f*bodies[i].m;
    }
    for(i=0;i<n;i++){ bodies[i].x+=bodies[i].vx; bodies[i].y+=bodies[i].vy; bodies[i].z+=bodies[i].vz; }
  }
  var acc=0; for(i=0;i<n;i++) acc += bodies[i].x + bodies[i].y + bodies[i].z; return Math.floor(acc*1000000);
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
