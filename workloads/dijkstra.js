// dijkstra - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function benchmark(){
  var N=180, graph=[], i,j,acc=0;
  for(i=0;i<N;i++){ graph[i]=[]; for(j=1;j<=4;j++) graph[i].push({to:(i*j+j*7)%N,w:1+((i+j)%9)}); }
  for(var src=0;src<20;src++){
    var dist=[], used=[]; for(i=0;i<N;i++){dist[i]=1e9; used[i]=0;} dist[src]=0;
    for(var step=0;step<N;step++){ var v=-1; for(i=0;i<N;i++) if(!used[i]&&(v<0||dist[i]<dist[v])) v=i; if(v<0) break; used[v]=1; for(j=0;j<graph[v].length;j++){ var e=graph[v][j]; if(dist[e.to]>dist[v]+e.w) dist[e.to]=dist[v]+e.w; } }
    acc += dist[(src*37)%N];
  }
  return acc;
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
