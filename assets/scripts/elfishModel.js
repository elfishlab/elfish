// action enums (for undo)
var ModelActionEffortAdd  = 0;
var ModelActionEffortDel  = 1;
var ModelActionGroupAdd   = 2;
var ModelActionGroupDel   = 3;
var ModelActionSpeciesAdd = 4;
var ModelActionSpeciesDel = 5;



function ModelAssertIndex(s,g,e) {
    var sps = window.elfish.species;
    if (sps.length <= s)
        throw new Error("Invalid index identifier (s): s,g,e=" + [s,g,e]);
    if (g < 0)
        return true;
    if (sps[s].groups.length <= g)
        throw new Error("Invalid index identifier (g): s,g,e=" + [s,g,e]);
    if (e < 0)
        return true;
    if (sps[s].groups[g].efforts.length <= e)
        throw new Error("Invalid index identifier (e): s,g,e=" + [s,g,e]);
    return true;
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

function ModelAddGroup(s,name) {
    ModelAssertIndex(s,-1,-1); // -1 since only s must exist
    var g = window.elfish.species[s].length+1;
    window.elfish.species[s].groups.push({name:name, efforts: []});
    var elt = {action:  ModelActionGroupAdd,
               species: s,
               group:   g,
               name:    name,
               efforts: []};
    ModelAddHistory(elt);
}

function ModelInsertGroupQuietly(histElt) {
    // inserts group into slot s,g without adding to history
    var efforts = histElt.efforts;
    var g       = histElt.group;
    var name    = histElt.name;
    var s       = histElt.species;
    ModelAssertIndex(s,g,-1);
    var val = {name:name, efforts:efforts};
    window.elfish.species[s].groups.splice(g,0,val);
}

function ModelDeleteGroup(s,g) {
    ModelAssertIndex(s,g,-1);
    var elt = {action:  ModelActionGroupDel,
               species: s,
               group:   g,
               efforts: window.elfish.species[s].groups[g].efforts,
               name:    window.elfish.species[s].groups[g].name};
    window.elfish.species[s].groups.splice(g,1);
    ModelAddHistory(elt);
}

function ModelAddEffort(s,g,val) {
    ModelAssertIndex(s,g,-1); // -1 since only s,g must exist
    var e = window.elfish.species[s].groups[g].length+1;
    var elt = {action:  ModelActionEffortAdd,
               species: s,
               group:   g,
               effort:  e};
    window.elfish.species[s].groups[g].efforts.push({value: val});
    ModelAddHistory(elt);
}

function ModelInsertEffortQuietly(histElt) {
    var val = {value: histElt.value};
    var s = histElt.species;
    var g = histElt.group;
    var e = histElt.effort;
    ModelAssertIndex(s,g,e+1);
    window.elfish.species[s].groups[g].efforts.splice(e,0,val);
}

function ModelDeleteEffort(s,g,e) {
    var sps = window.elfish.species;
    ModelAssertIndex(s,g,e);
    if (sps[s].groups[g].efforts.length == 0)
        return false;
    console.log("ModelDeleteEffort " + s + " " + g + " " + e);
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
        ModelAssertIndex(elt.species,elt.group,elt.effort);
        ModelDeleteEffort(elt.species,elt.group,elt.effort);
        ModelPopHistory(); // pop history since undo shan't be undone.
        break;
    case ModelActionEffortDel:
        ModelAssertIndex(elt.species,elt.group,elt.effort);
        ModelInsertEffortQuietly(elt);
        break;
    case ModelActionGroupAdd:
        ModelAssertIndex(elt.species,elt.group,-1);
        ModelDeleteGroup(elt.species,elt.group);
        ModelPopHistory();
    case ModelActionGroupDel:
        ModelAssertIndex(elt.species,elt.group);
        ModelInsertGroupQuietly(elt);
        break;
    default:
        console.error("Unsupported undo action " + a);
    }
    return true;
}
