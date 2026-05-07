// parser-combinator - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function parseNumber(s, pos){ var start=pos; while(pos<s.length && s.charCodeAt(pos)>=48 && s.charCodeAt(pos)<=57) pos++; return {v: parseInt(s.slice(start,pos),10), p:pos}; }
function parseExpr(s){ var r=parseNumber(s,0), v=r.v, p=r.p; while(p<s.length){ var op=s.charAt(p++); r=parseNumber(s,p); p=r.p; if(op==='+') v+=r.v; else if(op==='-') v-=r.v; else if(op==='*') v*=r.v; } return v; }
function benchmark() {
  var acc=0;
  for(var i=0;i<5000;i++){ var e=(i%97)+'+'+(i%31)+'*'+((i%7)+1)+'-'+(i%13); acc += parseExpr(e); }
  return acc;
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
