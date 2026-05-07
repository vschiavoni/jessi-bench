// Security-oriented workload: EVM bytecode analyzer
// Stresses hex parsing, opcode dispatch, histograms, and suspicious-pattern scanning.

var EVM_OPCODE_NAMES = {
  0x00: "STOP", 0x01: "ADD", 0x02: "MUL", 0x03: "SUB", 0x04: "DIV", 0x05: "SDIV",
  0x10: "LT", 0x11: "GT", 0x14: "EQ", 0x15: "ISZERO", 0x16: "AND", 0x17: "OR", 0x18: "XOR",
  0x20: "SHA3", 0x30: "ADDRESS", 0x31: "BALANCE", 0x32: "ORIGIN", 0x33: "CALLER", 0x34: "CALLVALUE",
  0x35: "CALLDATALOAD", 0x36: "CALLDATASIZE", 0x37: "CALLDATACOPY", 0x39: "CODECOPY",
  0x3b: "EXTCODESIZE", 0x3c: "EXTCODECOPY", 0x40: "BLOCKHASH", 0x41: "COINBASE", 0x42: "TIMESTAMP",
  0x43: "NUMBER", 0x44: "DIFFICULTY", 0x45: "GASLIMIT", 0x50: "POP", 0x51: "MLOAD", 0x52: "MSTORE",
  0x53: "MSTORE8", 0x54: "SLOAD", 0x55: "SSTORE", 0x56: "JUMP", 0x57: "JUMPI", 0x5b: "JUMPDEST",
  0xf0: "CREATE", 0xf1: "CALL", 0xf2: "CALLCODE", 0xf3: "RETURN", 0xf4: "DELEGATECALL", 0xfa: "STATICCALL",
  0xfd: "REVERT", 0xfe: "INVALID", 0xff: "SELFDESTRUCT"
};

function makeBytecode(seed, length) {
  var ops = [0x60,0x61,0x52,0x51,0x54,0x55,0x56,0x57,0x5b,0x33,0x34,0x35,0x14,0x15,0x20,0xf1,0xf4,0xff,0xfd,0x01,0x03];
  var s = "";
  var x = seed | 0;
  for (var i = 0; i < length; i++) {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    var op = ops[x % ops.length];
    s += (op < 16 ? "0" : "") + op.toString(16);
    if (op >= 0x60 && op <= 0x7f) {
      var n = op - 0x5f;
      for (var j = 0; j < n; j++) {
        x = (x * 1103515245 + 12345) & 0x7fffffff;
        var b = x & 255;
        s += (b < 16 ? "0" : "") + b.toString(16);
      }
    }
  }
  return s;
}

var EVM_SAMPLES = [];
for (var __i = 0; __i < 32; __i++) EVM_SAMPLES.push(makeBytecode(1000 + __i, 220));

function hexToBytes(hex) {
  var out = new Array(hex.length >> 1);
  for (var i = 0, j = 0; i < hex.length; i += 2, j++) out[j] = parseInt(hex.substr(i, 2), 16);
  return out;
}

function analyzeEvm(bytes) {
  var hist = {};
  var suspicious = 0;
  var pushes = 0;
  var jumpdests = 0;
  for (var pc = 0; pc < bytes.length; pc++) {
    var op = bytes[pc] & 255;
    hist[op] = (hist[op] || 0) + 1;
    if (op === 0xf4 || op === 0xff || op === 0xf1 || op === 0x32 || op === 0x42) suspicious++;
    if (op === 0x5b) jumpdests++;
    if (op >= 0x60 && op <= 0x7f) {
      pushes++;
      pc += op - 0x5f;
    }
  }
  var score = suspicious * 7 + pushes * 2 + jumpdests;
  for (var k in hist) if (hist.hasOwnProperty(k)) score += hist[k] * ((k | 0) % 5);
  return score;
}

function benchmark() {
  var total = 0;
  for (var r = 0; r < 6; r++) {
    for (var i = 0; i < EVM_SAMPLES.length; i++) total += analyzeEvm(hexToBytes(EVM_SAMPLES[i]));
  }
  return total;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
