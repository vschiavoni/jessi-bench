// Security-oriented workload: bloom filter for deny-list style membership tests
// Stresses hashing, bit arrays, bit operations, and membership queries.

var BLOOM_BITS = 32768;
function makeBits(n){ var a = new Array(n); for(var i=0;i<n;i++) a[i]=0; return a; }
function hash1(s){ var h=2166136261; for(var i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = (h + ((h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24))) | 0; } return h & 0x7fffffff; }
function hash2(s){ var h=5381; for(var i=0;i<s.length;i++) h=((h<<5)+h+s.charCodeAt(i))|0; return h & 0x7fffffff; }
function addBF(bits,s){ var a=hash1(s)%BLOOM_BITS,b=hash2(s)%BLOOM_BITS; bits[a>>5]|=1<<(a&31); bits[b>>5]|=1<<(b&31); bits[((a+b)|0)%BLOOM_BITS>>5]|=1<<(((a+b)|0)%BLOOM_BITS&31); }
function hasBF(bits,s){ var a=hash1(s)%BLOOM_BITS,b=hash2(s)%BLOOM_BITS,c=((a+b)|0)%BLOOM_BITS; return ((bits[a>>5]&(1<<(a&31))) && (bits[b>>5]&(1<<(b&31))) && (bits[c>>5]&(1<<(c&31))))?1:0; }
var DENY=[], QUERY=[];
for(var i=0;i<2000;i++){ DENY.push('malware-domain-'+i+'.example'); QUERY.push((i%3===0?'malware-domain-':'clean-domain-')+i+'.example'); }
function benchmark(){
  var bits=makeBits(BLOOM_BITS>>5), total=0;
  for(var i=0;i<DENY.length;i++) addBF(bits,DENY[i]);
  for(var r=0;r<45;r++) for(var j=0;j<QUERY.length;j++) total+=hasBF(bits,QUERY[j]);
  return total;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
