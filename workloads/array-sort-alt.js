var N = 4e5; // iterations
var array = [
    "warning", "understanding", "height", "consequence", "chocolate",
    "Arrival", "security", "Transportation", "Affair", "disease",
    "cheek", "thanks", "confusion", "poem", "1234", "assignment",
    "girlfriend", "Breath", "grocery", "editor", "science", "County",
    "Winner", "republic", "truth", "advice", "depression", "feedback",
    "candidate", "Volume", "competition", "potato", "Establishment",
    "office", "member", "classroom", "Tongue", "idea", "decision",
    "medicine", "Series", "insect", "supermarket", "loss", "poet",
    "region", "departure", "sister", "introduction", "entry", "sample",
];

function benchmark() {
    var res;
    for (var i = 0; i < N; ++i) res = array.slice().sort()[0];
    return res;
}

// Compatibility fallback: keep the workload runnable as a standalone script.
if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
    var startTime = Date.now();
    benchmark();
    console.log(Date.now() - startTime);
}
