var N = 1;

function buildRecords(count) {
    var records = new Array(count);
    var i;
    for (i = 0; i < count; i++) {
        records[i] = {
            id: i,
            name: "record-" + i,
            active: (i % 3) !== 0,
            score: (i * 17) % 1000,
            tags: ["alpha", "beta", "t" + (i % 10)]
        };
    }
    return records;
}

function benchmark() {
    var data = buildRecords(2500);
    var encoded = JSON.stringify(data);
    var decoded = JSON.parse(encoded);
    var sum = encoded.length;
    var i;

    for (i = 0; i < decoded.length; i += 5) {
        sum += decoded[i].id + decoded[i].score + decoded[i].tags[2].length;
    }

    var encoded2 = JSON.stringify({records: decoded, checksum: sum});
    return encoded2.length + sum;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
    var startTime = Date.now();
    var result = benchmark();
    console.log(result);
    console.log(Date.now() - startTime);
}
