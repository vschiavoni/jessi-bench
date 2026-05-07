var N = 1;

function benchmark() {
    var chunks = new Array(20000);
    var i;
    var s = "";
    var checksum = 0;

    for (i = 0; i < chunks.length; i++) {
        chunks[i] = "x" + (i % 100) + ":" + ((i * 17) % 1000) + ";";
    }

    for (i = 0; i < chunks.length; i++) {
        s += chunks[i];
        if ((i & 255) === 0) {
            checksum += s.length;
        }
    }

    for (i = 0; i < s.length; i += 97) {
        checksum += s.charCodeAt(i);
    }

    return checksum + s.length;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
    var startTime = Date.now();
    var result = benchmark();
    console.log(result);
    console.log(Date.now() - startTime);
}
