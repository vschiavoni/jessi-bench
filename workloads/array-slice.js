var N = 20; // iterations
var S = 1e4; // array size

var array = []
for (var i = 0; i < S; i++)
    array.push(i)

var res
var startTime = Date.now()

for (var i = 0; i < N; ++i)
    res = array.slice(i*(S/N))

console.log(Date.now() - startTime)
