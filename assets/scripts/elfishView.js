function setEst(s,g,e, val) {
    var elt = document.getElementById("est" + idString(s,g,e));
    if (elt)
        elt.innerHTML = "N̂ =" + val;
}

function setKe(s,g,e, val) {
    var elt = document.getElementById("ke" + idString(s,g,e));
    if (elt)
        elt.innerHTML = "CI/N̂ =" + val;
}

function setTe(s,g,e, val) {
    var elt = document.getElementById("te" + idString(s,g,e));
    if (elt)
        elt.innerHTML = "T/N̂ =" + val;
}

function getEst(s,g,e) {
    var elt = document.getElementById("est" + idString(s,g,e));
    if (elt)
        return elt.innerHTML;
    return 0;
}

function getKe(s,g,e) {
    var elt = document.getElementById("ke" + idString(s,g,e));
    if (elt)
        return elt.innerHTML;
    return 0;
}
function getTe(s,g,e) {
    var elt = document.getElementById("te" + idString(s,g,e));
    if (elt)
        return elt.innerHTML;
    return 0;
}



function getInputValue(sp, gr, ef) {
    var elt = getInput(sp,gr,ef);

    var retVal = NaN;
    if (elt !== null)
        retVal = elt.value;
    if (retVal === "")
        retVal = 0;
    return retVal;
}



function getEffortBox(s,g,e) {
    var effortboxId = "effort" + idString(s,g,e);
    var effortbox = document.getElementById(effortboxId);
    return effortbox;
}

function addEffortBoxClass(s,g,e,cls) {
    var eb = getEffortBox(s,g,e);
    if (!eb)
        return false;
    var lst = eb.classList;
    if (!lst.contains(cls))
        lst.add(cls);
    return true;
}

function removeEffortBoxClass(s,g,e,cls) {
    var eb = getEffortBox(s,g,e);
    if (!eb)
        return false;
    var lst = eb.classList;
    if (lst.contains(cls))
        lst.remove(cls);
    return true;
}

function setEstClass(s,g,e,cls) {
    var idn = "est" + idString(s,g,e);
    var elt = document.getElementById(idn);
    if (!elt)
        return false;

    elt.className = cls;
    return true;
}

function getInput(s,g,e) {
    var key = "ci" + idString(s,g,e);
    return document.getElementById(key);
}

function idString(s,g,e) {
    // TODO use JQuery instead of postfix on id of dom elts
    var postfix = "-" + s + "-" + g + "-" + e;
    return postfix;
}

function setMethodDropdown(meth) {
    // Updates the method selector, reflecting the stored value.
    var methodDropdown = document.getElementsByName("method")[0];
    var methodOptions = methodDropdown.getElementsByTagName("option");
    for (var i = 0; i < methodOptions.length; i++) {
        if (methodOptions[i].value == meth)
            methodOptions[i].selected = true;
    }
}
