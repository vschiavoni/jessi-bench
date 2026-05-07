var N = 20; // iterations
var S = 1e4; // array size

var array = []
for (var i = 0; i < S; i++)
    array.push("x" + i)

var res
var val = "x" + S * 0.8
var startTime = Date.now()

for (var i = 0; i < N; ++i)
    res = array[array.indexOf(val*(S/N))]

console.log(Date.now() - startTime)
