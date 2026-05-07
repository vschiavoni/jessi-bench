var N = 1;

function makePoint(i) {
    return {x: i, y: i + 1, z: i + 2, tag: "p" + (i % 8)};
}

function benchmark() {
    var objects = new Array(20000);
    var i;
    var sum = 0;

    for (i = 0; i < objects.length; i++) {
        objects[i] = makePoint(i);
    }

    for (i = 0; i < objects.length; i++) {
        var o = objects[i];
        sum += o.x + o.y - o.z;
        o.x = o.x + 1;
        o.y = o.y + o.x;
    }

    for (i = objects.length - 1; i >= 0; i--) {
        sum += objects[i].x ^ objects[i].y;
    }

    return sum;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
    var startTime = Date.now();
    var result = benchmark();
    console.log(result);
    console.log(Date.now() - startTime);
}
