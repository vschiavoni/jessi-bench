// lru-cache - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function benchmark(){
  var cap=128, map={}, head=null, tail=null, size=0, acc=0;
  function remove(n){ if(n.prev)n.prev.next=n.next; else head=n.next; if(n.next)n.next.prev=n.prev; else tail=n.prev; n.prev=n.next=null; }
  function addFront(n){ n.next=head; n.prev=null; if(head)head.prev=n; head=n; if(!tail)tail=n; }
  for(var i=0;i<50000;i++){
    var k='k'+((i*17)%257), n=map[k];
    if(n){ acc+=n.v; remove(n); addFront(n); }
    else { n={k:k,v:i&255,prev:null,next:null}; map[k]=n; addFront(n); size++; if(size>cap){ var old=tail; remove(old); delete map[old.k]; size--; } }
  }
  return acc;
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
