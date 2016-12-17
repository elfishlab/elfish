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

function updatePlot(sp, gr) {
    var arr = [];
    var est = [];
    var cf = [];

    if (plotIsValidIndices(sp, gr)) {
        var efforts = window.elfish.species[sp].groups[gr].efforts;
            for (var i = 0; i < efforts.length; i++) {
            arr.push(efforts[i].value);
            est.push(estimate(arr));
            cf.push(confidence(arr));
        }
    }

    var chartctx = plotFindCanvas(sp, gr);
    if (chartctx == null) {
        console.error("could not find canvas for sp=" + sp + ", gr=" + gr);
        return;
    }

    var myChart = new Chart(chartctx, {
        type: 'lineError',
        data: {
            labels: arr,
            datasets: [{
                label: plotGetName(sp, gr),
                data: arr,
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
