function plotGetName(sp, gr) {
    return window.elfish.species[sp].name + ": " +
        window.elfish.species[sp].groups[gr].name;
}

function plotIsValidIndices(sp, gr) {
    return window.elfish.species.length > sp
        && window.elfish.species[sp].groups.length > gr
        && window.elfish.species[sp].groups[gr].efforts.length > 0;
}

function plotFindCanvas(sp, gr) {
    var selector = "canvas.canvas-group-plot[data-group-id='" + gr + "'][data-specie-id='" + sp + "']";
    console.log("plot selector: " + selector);
    var canvas = $(selector);
    console.log("plot canvas: " + canvas);
    if (canvas == null){
        console.log("canvas null for " + sp + ", " + gr);
        return null;
    }
    return canvas[0].getContext("2d");
}

function allNegative(arr) {
    for (var i = 0; i < arr.length; i++)
        if (arr[i] >= 0)
            return false;
    return true;
}

function updatePlot(sp, gr) {
    var arr = [];
    var est = [];
    var cf = [];
    var labels = [];

    if (plotIsValidIndices(sp, gr)) {
        var efforts = window.elfish.species[sp].groups[gr].efforts;
        for (var i = 0; i < efforts.length; i++) {
            arr.push(efforts[i].value);
            labels.push("e" + (i+1)); // effort2, effort3, etc
            est.push(ElfishMathEstimate(arr, window.elfish.method));
            cf.push(ElfishMathConfidenceInterval(arr, window.elfish.method));
        }
    }
    // we don't plot the first effort since it has no estimate
    arr.shift();
    labels.shift();
    est.shift();
    cf.shift();

    if (est.length < 1 || allNegative(est))
        return;

    var chartctx = plotFindCanvas(sp, gr);
    if (chartctx == null) {
        console.error("could not find canvas for sp=" + sp + ", gr=" + gr);
        return;
    }

    var myChart = new Chart(chartctx, {
        type: 'lineError',
        data: {
            labels: labels,
            datasets: [{
                label: plotGetName(sp, gr),
                data: est,
                error: cf,
                errorDir : "both",
                errorStrokeWidth : 1,
                errorColor: "rgba(220, 70, 50, 1)",
                errorCapWidth : 0.75,
                lineTension: 0.1, // no bezier
                fill: false,      // background color under curve
                borderColor: "rgba(75,192,192,1)", // line color blueish
                pointRadius: 2    // size of drawn dots
            }]
        }
    });
}
