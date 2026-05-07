// Security-oriented workload: Wasm-like binary decoder
// Stresses byte parsing, LEB128 decoding, section iteration, bounds checks, and validation-like logic.

function makeModule(seed) {
  var bytes = [0,97,115,109,1,0,0,0];
  var x = seed | 0;
  function emitLeb(n) { do { var b = n & 127; n >>>= 7; if (n) b |= 128; bytes.push(b); } while (n); }
  for (var s = 1; s <= 8; s++) {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    var payloadLen = 12 + (x % 64);
    bytes.push(s);
    emitLeb(payloadLen);
    for (var i = 0; i < payloadLen; i++) {
      x = (x * 1103515245 + 12345) & 0x7fffffff;
      bytes.push(x & 255);
    }
  }
  return bytes;
}
var WASM_MODULES = [];
for (var __m = 0; __m < 96; __m++) WASM_MODULES.push(makeModule(9000 + __m));

function readLeb(bytes, state) {
  var result = 0, shift = 0, b;
  do {
    if (state.pos >= bytes.length) return -1;
    b = bytes[state.pos++] & 255;
    result |= (b & 127) << shift;
    shift += 7;
    if (shift > 35) return -1;
  } while (b & 128);
  return result >>> 0;
}
function decodeModule(bytes) {
  if (bytes.length < 8) return -100;
  var score = 0;
  for (var i = 0; i < 8; i++) score += bytes[i];
  var st = {pos: 8};
  while (st.pos < bytes.length) {
    var id = bytes[st.pos++] & 255;
    var len = readLeb(bytes, st);
    if (len < 0 || st.pos + len > bytes.length) return score - 999;
    var end = st.pos + len;
    var checksum = 0;
    while (st.pos < end) checksum = ((checksum << 5) - checksum + (bytes[st.pos++] & 255)) | 0;
    score += (id * 17) ^ checksum;
  }
  return score & 0x7fffffff;
}
function benchmark() {
  var total = 0;
  for (var r = 0; r < 20; r++) for (var i = 0; i < WASM_MODULES.length; i++) total += decodeModule(WASM_MODULES[i]);
  return total;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
