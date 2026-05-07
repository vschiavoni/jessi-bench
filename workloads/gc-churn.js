var N = 1;

function benchmark() {
    var checksum = 0;
    var rounds = 120;
    var width = 600;
    var live = [];
    var r, i;

    for (r = 0; r < rounds; r++) {
        var batch = new Array(width);
        for (i = 0; i < width; i++) {
            batch[i] = {
                a: i + r,
                b: "item-" + r + "-" + i,
                c: [i, i + 1, i + 2, i + 3]
            };
        }

        for (i = 0; i < width; i += 7) {
            checksum += batch[i].a + batch[i].c[2];
        }

        live.push(batch);
        if (live.length > 4) {
            live.shift();
        }
    }

    return checksum + live.length;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
    var startTime = Date.now();
    var result = benchmark();
    console.log(result);
    console.log(Date.now() - startTime);
}
