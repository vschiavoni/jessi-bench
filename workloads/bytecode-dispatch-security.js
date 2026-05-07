// Security-oriented workload: bytecode dispatch for a tiny policy VM
// Stresses switch dispatch, stack manipulation, integer operations, and sandbox-like interpretation.

function makeProgram(seed) {
  var ops = [], x = seed | 0;
  for (var i = 0; i < 180; i++) {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    var op = x % 9;
    ops.push(op);
    if (op === 0 || op === 1) ops.push(x & 255);
  }
  ops.push(8);
  return ops;
}
var POLICY_PROGRAMS = [];
for (var __p = 0; __p < 128; __p++) POLICY_PROGRAMS.push(makeProgram(300 + __p));
function runPolicy(program, subject) {
  var stack = [], pc = 0, risk = 0;
  while (pc < program.length) {
    switch (program[pc++]) {
      case 0: stack.push(program[pc++]); break;
      case 1: stack.push((subject + program[pc++]) & 255); break;
      case 2: stack.push((stack.pop() | 0) + (stack.pop() | 0)); break;
      case 3: stack.push((stack.pop() | 0) ^ (stack.pop() | 0)); break;
      case 4: stack.push(((stack.pop() | 0) & 15) === 0 ? 1 : 0); break;
      case 5: risk += stack.pop() ? 7 : 1; break;
      case 6: if ((stack.pop() | 0) & 1) pc = (pc + 3) % program.length; break;
      case 7: stack.push(risk & 255); break;
      case 8: return risk + stack.length;
      default: risk -= 100;
    }
  }
  return risk;
}
function benchmark() {
  var total = 0;
  for (var r = 0; r < 30; r++) for (var i = 0; i < POLICY_PROGRAMS.length; i++) total += runPolicy(POLICY_PROGRAMS[i], i + r);
  return total;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
