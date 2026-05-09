if (typeof console === "undefined") {
  var console = {
    log: function () {
      var out = "";
      for (var i = 0; i < arguments.length; i++) {
        if (i > 0) out += " ";
        out += String(arguments[i]);
      }
      print(out);
    }
  };
}

${workload}