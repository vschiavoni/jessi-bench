// Security-oriented workload: lightweight sanitizer
// Stresses repeated string scanning/replacement and deny-list style filtering.

var DIRTY=[];
for(var i=0;i<360;i++) DIRTY.push('<p>Hello '+i+'</p><script>alert(1)</script><a href="javascript:evil()" onclick="x()">x</a><img src=x onerror="bad()">');
function sanitize(s){
  var out='', i=0, lower=s.toLowerCase();
  while(i<s.length){
    if(lower.substr(i,7)==='<script') { var end=lower.indexOf('</script>',i); i=end<0?s.length:end+9; continue; }
    if(lower.substr(i,11)==='javascript:') { i+=11; continue; }
    if(lower.substr(i,3)===' on') { while(i<s.length && s.charAt(i)!=='>' && s.charAt(i)!==' ') i++; continue; }
    out+=s.charAt(i++);
  }
  return out;
}
function benchmark(){ var total=0; for(var r=0;r<55;r++) for(var i=0;i<DIRTY.length;i++) total+=sanitize(DIRTY[i]).length; return total; }

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
