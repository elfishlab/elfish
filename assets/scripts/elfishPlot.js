function PlotGetName(sp, gr) {
    return window.elfish.species[sp].name + ": " +
        window.elfish.species[sp].groups[gr].name;
}

function PlotIsValidIndices(sp, gr) {
    return window.elfish.species.length > sp
        && window.elfish.species[sp].groups.length > gr
        && window.elfish.species[sp].groups[gr].efforts.length > 0;
}

function PlotCreateNewCanvas(sp, gr) {
    var selector = ".canvas-container[data-group-id='" + gr + "'][data-specie-id='" + sp + "']";

    var canvas;
    var canvasContainer = $(selector)[0];

    if (canvasContainer == null){
        console.error("canvas container null for " + sp + ", " + gr);
        return null;
    }

    var canvasHidden = false;
    while (canvasContainer.firstChild) {
        var child = canvasContainer.firstChild;
        if (child.tagName == "CANVAS") {
            if (child.style.display == "none")
                canvasHidden = true;
        }
        canvasContainer.removeChild(child);
    }

    canvas = canvasContainer.appendChild(document.createElement("canvas"));
    if (canvasHidden)
        canvas.style.display = "none";

    if (!canvas) {
        console.error("canvas null for " + sp + ", " + gr);
        return null;
    }

    return canvas.getContext("2d");
}

function allNegative(arr) {
    for (var i = 0; i < arr.length; i++)
        if (arr[i] >= 0)
            return false;
    return true;
}

function PlotUpdatePlot(sp, gr) {
    var arr = [];
    var est = [];
    var cf = [];
    var labels = [];

    if (PlotIsValidIndices(sp, gr)) {
        var efforts = window.elfish.species[sp].groups[gr].efforts;
        for (var i = 0; i < efforts.length; i++) {
            arr.push(efforts[i].value);
            labels.push(i+1); // effort2, effort3, etc
            est.push(ElfishMathEstimate(arr, window.elfish.method));
            cf.push(ElfishMathConfidenceInterval(arr, window.elfish.method));
        }
    }

    // The next two variables, acc_catch and trunc_cf exist solely to plot the
    // downwards error line, and we only need trunc_cf (truncated confidence).
    //
    // The downwards error line is never "lower" than the total accumulated
    // catch at a certain point.
    var acc_catch = [efforts[0].value];
    for (var idx = 1; idx < est.length; idx++) {
        acc_catch.push(acc_catch[idx-1] + efforts[idx].value);
    }
    var trunc_cf = [];
    for (var idx = 0; idx < est.length; idx++) {
        trunc_cf.push(Math.min(cf[idx], est[idx]-acc_catch[idx]));
    }

    // we don't plot the first effort since it has no estimate
    arr.shift();
    labels.shift();
    est.shift();
    cf.shift();
    trunc_cf.shift();

    if (est.length < 2 || allNegative(est))
        return;

    var chartctx = PlotCreateNewCanvas(sp, gr);
    if (chartctx == null) {
        console.error("could not find canvas for sp=" + sp + ", gr=" + gr);
        return;
    }

    var myChart = new Chart(chartctx, {
        type: 'lineError',
        data: {
            labels: labels,
            datasets: [{
                label: '',
                data: est,
                error: cf,
                errorDir : "up",
                errorStrokeWidth : 1,
                errorColor: "rgba(220, 70, 50, 1)",
                errorCapWidth : 0.75,
                lineTension: 0.1, // no bezier
                fill: false,      // background color under curve
                borderColor: "rgba(75,192,192,1)", // line color blueish
                pointRadius: 2    // size of drawn dots
            }, {
                label: '',
                data: est,
                error: trunc_cf,
                errorDir: "down",
                errorStrokeWidth : 1,
                errorColor: "rgba(220, 70, 50, 1)",
                errorCapWidth : 0.75,
                lineTension: 0.1, // no bezier
                fill: false,      // background color under curve
                borderColor: "rgba(0,0,0,0)" // invisible
            }]
        },
        options: {
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Estimate (N̂)'
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Effort #'
                    }
                }]
            }
        }
    });
}
