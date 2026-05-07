// class-inheritance-compatible - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function Animal(name){ this.name = name; }
Animal.prototype.speak = function(x){ return this.name.length + x; };
function Dog(name, power){ Animal.call(this, name); this.power = power; }
Dog.prototype = Object.create ? Object.create(Animal.prototype) : new Animal('');
Dog.prototype.constructor = Dog;
Dog.prototype.speak = function(x){ return Animal.prototype.speak.call(this, x) + this.power; };
function benchmark() {
  var arr=[], acc=0, i;
  for (i=0;i<5000;i++) arr[i] = new Dog('dog' + i, i & 31);
  for (var r=0;r<50;r++) for (i=0;i<arr.length;i+=5) acc += arr[i].speak(r);
  return acc;
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
