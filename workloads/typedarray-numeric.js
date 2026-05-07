var N = 1;

function makeFloatArray(n) {
    if (typeof Float64Array !== "undefined") {
        return new Float64Array(n);
    }
    return new Array(n);
}

function benchmark() {
    var size = 80000;
    var a = makeFloatArray(size);
    var b = makeFloatArray(size);
    var c = makeFloatArray(size);
    var i;
    var sum = 0;

    for (i = 0; i < size; i++) {
        a[i] = (i % 97) * 0.5 + 1.0;
        b[i] = (i % 89) * 0.25 + 2.0;
    }

    for (i = 0; i < size; i++) {
        c[i] = a[i] * 1.0001 + b[i] * 0.9999;
    }

    for (i = 0; i < size; i += 3) {
        sum += c[i] / (1.0 + (i % 11));
    }

    return Math.floor(sum);
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
    var startTime = Date.now();
    var result = benchmark();
    console.log(result);
    console.log(Date.now() - startTime);
}
