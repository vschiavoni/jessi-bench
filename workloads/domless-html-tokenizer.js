// Security-oriented workload: DOM-less HTML tokenizer
// Stresses string scanning, state machines, tag/attribute parsing, and sanitizer-like checks.

var HTML_CHUNKS = [];
for (var i = 0; i < 256; i++) {
  HTML_CHUNKS.push('<div class="c' + i + '"><a href="/x?' + i + '" onclick="evil()">hello&nbsp;' + i + '</a><script>bad()</script><img src=x onerror=y></div>');
}
function tokenizeHtml(s) {
  var tokens = 0, suspicious = 0, attrs = 0;
  var i = 0, n = s.length;
  while (i < n) {
    var c = s.charAt(i);
    if (c === '<') {
      tokens++;
      i++;
      var name = "";
      while (i < n) {
        c = s.charAt(i);
        if (c === '>' || c === '/' || c === ' ' || c === '\t' || c === '\n') break;
        name += c.toLowerCase(); i++;
      }
      if (name === 'script' || name === 'iframe') suspicious += 10;
      while (i < n && s.charAt(i) !== '>') {
        while (i < n && s.charAt(i) === ' ') i++;
        var an = "";
        while (i < n) {
          c = s.charAt(i);
          if (c === '=' || c === '>' || c === ' ') break;
          an += c.toLowerCase(); i++;
        }
        if (an.length) { attrs++; if (an.indexOf('on') === 0) suspicious += 5; }
        if (s.charAt(i) === '=') {
          i++;
          var q = s.charAt(i);
          if (q === '"' || q === "'") { i++; while (i < n && s.charAt(i) !== q) i++; if (i < n) i++; }
          else { while (i < n && s.charAt(i) !== ' ' && s.charAt(i) !== '>') i++; }
        } else i++;
      }
    } else if (c === '&') {
      tokens++; while (i < n && s.charAt(i) !== ';' && s.charAt(i) !== '<') i++;
    }
    i++;
  }
  return tokens + attrs * 3 + suspicious * 11;
}
function benchmark() {
  var total = 0;
  for (var r = 0; r < 35; r++) for (var i = 0; i < HTML_CHUNKS.length; i++) total += tokenizeHtml(HTML_CHUNKS[i]);
  return total;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
