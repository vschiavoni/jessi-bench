// Security-oriented workload: schema validation
// Stresses deep object traversal, type checks, arrays, and policy-style validation.

var SCHEMA_RECORDS = [];
for (var i = 0; i < 600; i++) {
  SCHEMA_RECORDS.push({
    id: i,
    user: {name: 'user' + i, email: 'u' + i + '@example.org', active: (i % 7) !== 0},
    roles: i % 13 === 0 ? ['admin','reader'] : ['reader'],
    limits: {requests: 1000 + i, storage: i * 32},
    tags: ['a' + (i%5), 'b' + (i%11)]
  });
}
function validateRecord(r) {
  var score = 0;
  if (typeof r.id !== 'number') return -1;
  if (!r.user || typeof r.user.name !== 'string' || r.user.name.length < 3) score -= 10;
  if (typeof r.user.email === 'string' && r.user.email.indexOf('@') > 0) score += 3;
  if (r.roles && r.roles.length) {
    for (var i = 0; i < r.roles.length; i++) {
      if (r.roles[i] === 'admin') score += r.user.active ? 17 : -50;
      else if (r.roles[i] === 'reader') score += 5;
    }
  }
  if (r.limits.requests > 1200) score += 2;
  if (r.tags) for (var j = 0; j < r.tags.length; j++) score += r.tags[j].length;
  return score;
}
function benchmark() {
  var total = 0;
  for (var r = 0; r < 80; r++) for (var i = 0; i < SCHEMA_RECORDS.length; i++) total += validateRecord(SCHEMA_RECORDS[i]);
  return total;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
