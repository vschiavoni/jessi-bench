// tree-traversal - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function build(depth, seed){ if(depth===0) return {v:seed,l:null,r:null}; return {v:seed,l:build(depth-1,seed*2+1),r:build(depth-1,seed*2+2)}; }
function walk(n){ if(!n) return 0; return n.v + walk(n.l) - walk(n.r); }
function benchmark() {
  var root = build(11, 1), acc=0;
  for (var i=0;i<1200;i++) acc += walk(root) & 0xffff;
  return acc;
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
