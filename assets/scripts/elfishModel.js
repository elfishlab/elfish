function ModelSetEst(s,g,e,val) {
    window.elfish.species[s].groups[g].efforts[e].est = val;
}

function ModelGetEst(s,g,e) {
    return window.elfish.species[s].groups[g].efforts[e].est;
}

function ModelSetKe(s,g,e,val) {
    window.elfish.species[s].groups[g].efforts[e].ke = val;
}

function ModelGetKe(s,g,e) {
    return window.elfish.species[s].groups[g].efforts[e].ke;
}

function ModelSetTe(s,g,e,val) {
    window.elfish.species[s].groups[g].efforts[e].te = val;
}

function ModelGetTe(s,g,e) {
    return window.elfish.species[s].groups[g].efforts[e].te;
}

function ModelHistoryAddEffort(s,g,e) {
    var elt = {species: s,
               group:   g,
               effort:  e};
    window.elfish.history.push(elt);
}

function ModelHistoryUndo() {
    var h = window.elfish.history;
    if (h.length > 0) {
        var elt = h[h.length-1];
        window.elfish.history.splice(h.length-1,1);
        var s = elt.species;
        var g = elt.group;
        var e = elt.effort;
        if (e > 0)
            window.elfish.species[s].groups[g].efforts.splice(e,1);
    }
}
