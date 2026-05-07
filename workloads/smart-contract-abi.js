// Security-oriented workload: smart-contract ABI-like encode/decode
// Stresses hex/string manipulation, integer packing, selector dispatch, and validation-like logic.

function pad64(hex) {
  while (hex.length < 64) hex = "0" + hex;
  return hex;
}
function toUint256(n) {
  var hex = Math.floor(n).toString(16);
  return pad64(hex);
}
function encodeAddress(seed) {
  var x = seed | 0, s = "";
  for (var i = 0; i < 20; i++) {
    x = (x * 1664525 + 1013904223) | 0;
    var b = x & 255;
    s += (b < 16 ? "0" : "") + b.toString(16);
  }
  return pad64(s);
}
function encodeTransfer(toSeed, amount) {
  return "a9059cbb" + encodeAddress(toSeed) + toUint256(amount);
}
function decodeTransfer(data) {
  if (data.length !== 8 + 64 + 64) return null;
  if (data.substr(0, 8) !== "a9059cbb") return null;
  var addr = data.substr(8 + 24, 40);
  var amountHex = data.substr(72, 64);
  var amount = parseInt(amountHex.substr(48), 16);
  var risk = 0;
  if (amount === 0) risk += 1;
  if (addr.substr(0, 8) === "00000000") risk += 4;
  if (addr.substr(32, 8) === "ffffffff") risk += 8;
  return amount + risk + addr.charCodeAt(0);
}

var ABI_CALLS = [];
for (var i = 0; i < 512; i++) ABI_CALLS.push(encodeTransfer(i + 77, (i * 9973) % 10000000));

function benchmark() {
  var total = 0;
  for (var r = 0; r < 12; r++) {
    for (var i = 0; i < ABI_CALLS.length; i++) total += decodeTransfer(ABI_CALLS[i]) || 0;
  }
  return total;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
