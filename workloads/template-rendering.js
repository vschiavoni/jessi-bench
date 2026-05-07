var N = 1;

function render(template, context) {
    var out = "";
    var i = 0;
    while (i < template.length) {
        var start = template.indexOf("{{", i);
        if (start < 0) {
            out += template.slice(i);
            break;
        }
        out += template.slice(i, start);
        var end = template.indexOf("}}", start + 2);
        if (end < 0) {
            out += template.slice(start);
            break;
        }
        var key = template.slice(start + 2, end);
        out += context[key] === undefined ? "" : String(context[key]);
        i = end + 2;
    }
    return out;
}

function benchmark() {
    var template = "<li id='{{id}}'><span>{{name}}</span><b>{{score}}</b><em>{{tag}}</em></li>";
    var html = "<ul>";
    var checksum = 0;
    var i;

    for (i = 0; i < 6000; i++) {
        var ctx = {
            id: "row-" + i,
            name: "Name " + (i % 200),
            score: (i * 31) % 1000,
            tag: "tag" + (i % 17)
        };
        var row = render(template, ctx);
        html += row;
        if ((i & 127) === 0) checksum += row.length;
    }

    html += "</ul>";
    for (i = 0; i < html.length; i += 211) {
        checksum += html.charCodeAt(i);
    }
    return checksum + html.length;
}

if (typeof __JESSI_BENCH_HARNESS__ === "undefined") {
    var startTime = Date.now();
    var result = benchmark();
    console.log(result);
    console.log(Date.now() - startTime);
}
