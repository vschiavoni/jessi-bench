// Security-oriented workload: CSV parser with formula-injection checks
// Stresses text parsing, quoted fields, numeric conversion, and suspicious input scanning.

var CSV_ROWS=[];
for(var i=0;i<1200;i++) CSV_ROWS.push('user'+i+',"dept,'+(i%9)+'",'+(i%17===0?'=cmd|bad':'note'+i)+','+(1000+i));
function parseCsvLine(line){
  var out=[], cur='', inq=false;
  for(var i=0;i<line.length;i++){
    var c=line.charAt(i);
    if(c==='"'){ if(inq && line.charAt(i+1)==='"'){cur+='"';i++;} else inq=!inq; }
    else if(c===',' && !inq){ out.push(cur); cur=''; }
    else cur+=c;
  }
  out.push(cur); return out;
}
function scoreRow(fields){
  var score=fields.length;
  for(var i=0;i<fields.length;i++){
    var f=fields[i];
    if(f.length && (f.charAt(0)==='=' || f.charAt(0)==='+' || f.charAt(0)==='-' || f.charAt(0)==='@')) score+=50;
    var n=parseInt(f,10); if(!isNaN(n)) score+=n&15;
  }
  return score;
}
function benchmark(){ var total=0; for(var r=0;r<70;r++) for(var i=0;i<CSV_ROWS.length;i++) total+=scoreRow(parseCsvLine(CSV_ROWS[i])); return total; }

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
