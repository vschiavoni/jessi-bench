var N = 1;

function hasNativeMapSet() {
    return typeof Map !== "undefined" && typeof Set !== "undefined";
}

function benchmarkNative() {
    var m = new Map();
    var s = new Set();
    var i;
    var sum = 0;

    for (i = 0; i < 30000; i++) {
        var key = "k" + (i % 12000);
        m.set(key, i);
        s.add(key);
    }

    for (i = 0; i < 30000; i++) {
        var q = "k" + ((i * 13) % 12000);
        if (s.has(q)) {
            sum += m.get(q) || 0;
        }
    }

    for (i = 0; i < 6000; i++) {
        m.delete("k" + i);
        s.delete("k" + i);
    }

    return sum + m.size + s.size;
}

function benchmarkObjectFallback() {
    var m = {};
    var s = {};
    var i;
    var sum = 0;
    var count = 0;

    for (i = 0; i < 30000; i++) {
        var key = "k" + (i % 12000);
        if (!s[key]) {
            count++;
        }
        m[key] = i;
        s[key] = true;
    }

    for (i = 0; i < 30000; i++) {
        var q = "k" + ((i * 13) % 12000);
        if (s[q]) {
            sum += m[q] || 0;
        }
    }

    for (i = 0; i < 6000; i++) {
        var d = "k" + i;
        if (s[d]) {
            count--;
        }
        delete m[d];
        delete s[d];
    }

    return sum + count;
}

function benchmark() {
    if (hasNativeMapSet()) {
        return benchmarkNative();
    }
    return benchmarkObjectFallback();
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
    var startTime = Date.now();
    var result = benchmark();
    console.log(result);
    console.log(Date.now() - startTime);
}
