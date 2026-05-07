// astar-grid - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function benchmark(){
  var W=48,H=48, acc=0;
  for(var run=0;run<20;run++){
    var open=[{x:0,y:0,g:0,f:0}], seen={}, targetX=W-1,targetY=H-1;
    while(open.length){
      var bi=0; for(var i=1;i<open.length;i++) if(open[i].f<open[bi].f) bi=i;
      var cur=open.splice(bi,1)[0], key=cur.x+','+cur.y; if(seen[key]) continue; seen[key]=1;
      if(cur.x===targetX&&cur.y===targetY){ acc+=cur.g; break; }
      var dirs=[[1,0],[-1,0],[0,1],[0,-1]];
      for(i=0;i<4;i++){ var nx=cur.x+dirs[i][0], ny=cur.y+dirs[i][1]; if(nx<0||ny<0||nx>=W||ny>=H) continue; if(((nx*17+ny*31+run)&15)===0) continue; var h=Math.abs(targetX-nx)+Math.abs(targetY-ny); open.push({x:nx,y:ny,g:cur.g+1,f:cur.g+1+h}); }
    }
  }
  return acc;
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
