// Security-oriented workload: small JSON-like parser
// Stresses recursive descent parsing, untrusted-input validation, string scanning, and allocation.

var JSONLIKE_INPUTS = [];
for (var i = 0; i < 180; i++) JSONLIKE_INPUTS.push('{"user":"u' + i + '","roles":["reader","admin"],"quota":' + (i*17%1000) + ',"flags":{"mfa":true,"locked":false}}');

function Parser(s) { this.s = s; this.i = 0; }
Parser.prototype.ws = function(){ while (this.i < this.s.length && this.s.charCodeAt(this.i) <= 32) this.i++; };
Parser.prototype.ch = function(c){ this.ws(); if (this.s.charAt(this.i) !== c) throw new Error('expected ' + c); this.i++; };
Parser.prototype.str = function(){ var out='', c; this.ch('"'); while (this.i < this.s.length) { c=this.s.charAt(this.i++); if(c==='"') return out; if(c==='\\') c=this.s.charAt(this.i++); out+=c; } throw new Error('string'); };
Parser.prototype.num = function(){ this.ws(); var j=this.i; while(this.i<this.s.length && /[0-9\-]/.test(this.s.charAt(this.i))) this.i++; return parseInt(this.s.substring(j,this.i),10); };
Parser.prototype.val = function(){ this.ws(); var c=this.s.charAt(this.i); if(c==='"') return this.str(); if(c==='{') return this.obj(); if(c==='[') return this.arr(); if(this.s.substr(this.i,4)==='true'){this.i+=4;return true;} if(this.s.substr(this.i,5)==='false'){this.i+=5;return false;} return this.num(); };
Parser.prototype.arr = function(){ var a=[]; this.ch('['); this.ws(); if(this.s.charAt(this.i)===']'){this.i++;return a;} while(true){ a.push(this.val()); this.ws(); if(this.s.charAt(this.i)===']'){this.i++;return a;} this.ch(','); } };
Parser.prototype.obj = function(){ var o={}; this.ch('{'); this.ws(); if(this.s.charAt(this.i)==='}'){this.i++;return o;} while(true){ var k=this.str(); this.ch(':'); o[k]=this.val(); this.ws(); if(this.s.charAt(this.i)==='}'){this.i++;return o;} this.ch(','); } };
function validate(o) { var score = 0; if (o.roles && o.roles.length) score += o.roles.length * 11; if (o.flags && o.flags.mfa) score += 13; if (o.quota > 500) score += 7; return score + o.user.length; }
function benchmark() {
  var total = 0;
  for (var r = 0; r < 25; r++) for (var i = 0; i < JSONLIKE_INPUTS.length; i++) total += validate((new Parser(JSONLIKE_INPUTS[i])).val());
  return total;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
