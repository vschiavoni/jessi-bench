// Security-oriented workload: mini expression interpreter
// Stresses AST interpretation, environments, policy checks, and function-call-like recursion.

function lit(v){return {t:0,v:v};} function key(k){return {t:1,k:k};} function add(a,b){return {t:2,a:a,b:b};}
function gt(a,b){return {t:3,a:a,b:b};} function and(a,b){return {t:4,a:a,b:b};} function iff(c,a,b){return {t:5,c:c,a:a,b:b};}
var ASTS=[];
for(var i=0;i<180;i++) ASTS.push(iff(and(gt(key('amount'),lit(i%100)),gt(key('risk'),lit(i%17))),add(key('amount'),key('risk')),lit(0)));
function evalAst(n, env){
  switch(n.t){
    case 0: return n.v;
    case 1: return env[n.k] || 0;
    case 2: return evalAst(n.a,env)+evalAst(n.b,env);
    case 3: return evalAst(n.a,env)>evalAst(n.b,env)?1:0;
    case 4: return evalAst(n.a,env)&&evalAst(n.b,env)?1:0;
    case 5: return evalAst(n.c,env)?evalAst(n.a,env):evalAst(n.b,env);
  }
  return 0;
}
function benchmark(){
  var total=0;
  for(var r=0;r<180;r++){
    var env={amount:(r*37)%1000,risk:(r*19)%40};
    for(var i=0;i<ASTS.length;i++) total+=evalAst(ASTS[i],env);
  }
  return total;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
