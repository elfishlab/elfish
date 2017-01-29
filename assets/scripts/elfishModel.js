// action enums (for undo)
var ModelActionEffortAdd  = 0;
var ModelActionEffortDel  = 1;
var ModelActionGroupAdd   = 2;
var ModelActionGroupDel   = 3;
var ModelActionSpeciesAdd = 4;
var ModelActionSpeciesDel = 5;



function ModelAssertIndex(s,g,e) {
    var sps = window.elfish.species;
    if (sps.length <= s ||
        sps[s].groups.length <= g ||
        sps[s].groups[g].efforts.length <= e)
        throw new Error("Invalid index identifier: s,g,e=" + [s,g,e]);
}

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

function ModelAddHistory(elt) {
    window.elfish.history.push(elt);
}

function ModelPopHistory() {
    var h = window.elfish.history;
    if (h.length == 0)
        return null;
    var elt = h[h.length-1];
    window.elfish.history.splice(h.length-1,1);
    return elt;
}

function ModelAddEffort(s,g,e,val) {
    ModelAssertIndex(s,g,-1); // -1 since only s,g must exist
    var elt = {action:  ModelActionEffortAdd,
               species: s,
               group:   g,
               effort:  e};
    window.elfish.species[s].groups[g].efforts.push({value: val});
    ModelAddHistory(elt);
}

function ModelInsertEffortQuietly(s,g,e,val) {
    // inserts val into slot s,g,e without adding to history
    ModelAssertIndex(s,g,e);
    var elt = {value: val};
    window.elfish.species[s].groups[g].efforts.splice(e,0,elt);
}

function ModelDeleteEffort(s,g,e) {
    var sps = window.elfish.species;
    ModelAssertIndex(s,g,e);
    if (sps[s].groups[g].efforts.length == 0)
        return false;
    var eff = sps[s].groups[g].efforts[e];
    var value = eff.value;
    var elt = {action:  ModelActionEffortDel,
               species: s,
               group:   g,
               effort:  e,
               value:   value};
    window.elfish.species[s].groups[g].efforts.splice(e,1);
    ModelAddHistory(elt);
    return true;
}

function ModelHistoryUndo() {
    var elt = ModelPopHistory();
    var a = elt.action;
    var s = elt.species;
    var g = elt.group;
    var e = elt.effort;
    switch (a) {
    case ModelActionEffortAdd:
        ModelAssertIndex(s,g,e);
        ModelDeleteEffort(s,g,e);
        ModelPopHistory(); // pop history since undo shan't be undone.
        break;
    case ModelActionEffortDel:
        ModelAssertIndex(s,g,e);
        ModelInsertEffortQuietly(s,g,e,elt.value);
        break;
    default:
        console.error("Unsupported undo action " + a);
    }
    return true;
}
