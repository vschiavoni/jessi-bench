// Security-oriented workload: deep equality for policy/cache objects
// Stresses recursive traversal, arrays, objects, branch-heavy comparisons.

function makeObj(i){ return {id:i,user:{name:'u'+i,roles:['reader',i%11===0?'admin':'user']},policy:{mfa:i%3===0,limit:i*7%1000},tags:[i%5,i%7,i%13]}; }
var PAIRS=[];
for(var i=0;i<700;i++){ var a=makeObj(i), b=makeObj(i); if(i%10===0) b.policy.limit++; PAIRS.push([a,b]); }
function deepEqual(a,b){
  if(a===b) return true;
  if(typeof a!==typeof b) return false;
  if(!a || !b || typeof a!=='object') return false;
  var ak=[], bk=[], k;
  for(k in a) if(a.hasOwnProperty(k)) ak.push(k);
  for(k in b) if(b.hasOwnProperty(k)) bk.push(k);
  if(ak.length!==bk.length) return false;
  for(var i=0;i<ak.length;i++){ k=ak[i]; if(!b.hasOwnProperty(k) || !deepEqual(a[k],b[k])) return false; }
  return true;
}
function benchmark(){ var total=0; for(var r=0;r<90;r++) for(var i=0;i<PAIRS.length;i++) total+=deepEqual(PAIRS[i][0],PAIRS[i][1])?1:0; return total; }

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
