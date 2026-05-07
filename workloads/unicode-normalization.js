// unicode-normalization - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

var UNICODE_DATA = "Café déjà vu — naïve façade élève Zürich São Paulo Αθήνα 東京 Москва";
function foldAsciiLike(s) {
  var out = "";
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    if (c >= 65 && c <= 90) out += String.fromCharCode(c + 32);
    else if (c === 233 || c === 232 || c === 234 || c === 235) out += 'e';
    else if (c === 224 || c === 225 || c === 226 || c === 228 || c === 227) out += 'a';
    else if (c === 239 || c === 238) out += 'i';
    else if (c === 231) out += 'c';
    else out += s.charAt(i);
  }
  return out;
}
function benchmark() {
  var acc = 0;
  for (var r = 0; r < 900; r++) {
    var s = UNICODE_DATA + " #" + r;
    var t = (typeof s.normalize === 'function') ? s.normalize('NFC') : s;
    t = foldAsciiLike(t);
    for (var i = 0; i < t.length; i++) acc = ((acc * 33) + t.charCodeAt(i)) & 0x7fffffff;
  }
  return acc;
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
