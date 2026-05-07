var N = 1;

function buildProgram(size) {
    var program = new Array(size);
    var i;
    for (i = 0; i < size; i++) {
        program[i] = (i * 1103515245 + 12345) & 7;
    }
    return program;
}

function benchmark() {
    var program = buildProgram(180000);
    var a = 1, b = 3, c = 7, pc;

    for (pc = 0; pc < program.length; pc++) {
        switch (program[pc]) {
            case 0:
                a = (a + b) | 0;
                break;
            case 1:
                b = (b ^ c) | 0;
                break;
            case 2:
                c = (c + 17) | 0;
                break;
            case 3:
                a = (a * 3 + 1) | 0;
                break;
            case 4:
                b = (b + (a >>> 3)) | 0;
                break;
            case 5:
                c = (c ^ (b << 1)) | 0;
                break;
            case 6:
                a = (a - c) | 0;
                break;
            default:
                b = (b + 11) | 0;
                break;
        }
    }

    return (a ^ b ^ c) | 0;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
    var startTime = Date.now();
    var result = benchmark();
    console.log(result);
    console.log(Date.now() - startTime);
}
