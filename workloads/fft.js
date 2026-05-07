// fft - harness-compatible JeSsi-Bench workload
// Self-contained ES5-style benchmark; exposes benchmark() for harnessed mode.

function benchmark() {
  var n = 256, rounds = 24, acc = 0;
  var re = new Array(n), im = new Array(n);
  for (var r=0;r<rounds;r++) {
    for (var i=0;i<n;i++) { re[i] = Math.sin((i+r)*0.01); im[i] = Math.cos((i-r)*0.02); }
    // iterative radix-2 FFT
    var j=0;
    for (i=1;i<n;i++) { var bit=n>>1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i<j) { var tr=re[i]; re[i]=re[j]; re[j]=tr; tr=im[i]; im[i]=im[j]; im[j]=tr; } }
    for (var len=2; len<=n; len<<=1) {
      var ang = -2*Math.PI/len, wlenr=Math.cos(ang), wleni=Math.sin(ang);
      for (i=0;i<n;i+=len) {
        var wr=1, wi=0;
        for (j=0;j<len/2;j++) {
          var uR=re[i+j], uI=im[i+j];
          var vR=re[i+j+len/2]*wr - im[i+j+len/2]*wi;
          var vI=re[i+j+len/2]*wi + im[i+j+len/2]*wr;
          re[i+j]=uR+vR; im[i+j]=uI+vI; re[i+j+len/2]=uR-vR; im[i+j+len/2]=uI-vI;
          var nwr=wr*wlenr - wi*wleni; wi=wr*wleni + wi*wlenr; wr=nwr;
        }
      }
    }
    acc += Math.abs(re[(r*19)&255]) + Math.abs(im[(r*23)&255]);
  }
  return Math.floor(acc*1000000);
}


if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
  var startTime = Date.now();
  var result = benchmark();
  console.log(result);
  console.log(Date.now() - startTime);
}
