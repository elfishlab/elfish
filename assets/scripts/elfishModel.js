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
