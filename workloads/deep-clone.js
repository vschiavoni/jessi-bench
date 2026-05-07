var N = 1;

function makeTree(depth, fanout, seed) {
    if (depth === 0) {
        return {value: seed, label: "leaf-" + seed, values: [seed, seed + 1, seed + 2]};
    }
    var children = new Array(fanout);
    var i;
    for (i = 0; i < fanout; i++) {
        children[i] = makeTree(depth - 1, fanout, seed * 7 + i + 1);
    }
    return {id: seed, name: "node-" + seed, children: children, flag: (seed % 2) === 0};
}

function clone(value) {
    var i;
    if (value === null || typeof value !== "object") {
        return value;
    }
    if (Object.prototype.toString.call(value) === "[object Array]") {
        var arr = new Array(value.length);
        for (i = 0; i < value.length; i++) {
            arr[i] = clone(value[i]);
        }
        return arr;
    }
    var obj = {};
    for (var k in value) {
        if (Object.prototype.hasOwnProperty.call(value, k)) {
            obj[k] = clone(value[k]);
        }
    }
    return obj;
}

function checksumTree(node) {
    var sum = 0;
    var i;
    if (node.value !== undefined) {
        return node.value + node.label.length + node.values.length;
    }
    sum += node.id + node.name.length + (node.flag ? 1 : 0);
    for (i = 0; i < node.children.length; i++) {
        sum += checksumTree(node.children[i]);
    }
    return sum;
}

function benchmark() {
    var root = makeTree(5, 4, 1);
    var sum = 0;
    var i;
    for (i = 0; i < 25; i++) {
        var copied = clone(root);
        copied.children[0].id += i;
        sum += checksumTree(copied);
    }
    return sum;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
    var startTime = Date.now();
    var result = benchmark();
    console.log(result);
    console.log(Date.now() - startTime);
}
