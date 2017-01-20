function initiateStorage() {
    window.elfish = {
        upperlimit: 300000,
        confidence: 0.5,

        /* The amount of efforts that are create upon group creation. It's also
        the lowest number of efforts possible in any group. */
        minimumNumbersOfEfforts: 2,
        species: [],
        visibleSpecies: null
    };
    window.elfish.method = "cs";
}

/**
 *  JSONs and stores the entire window.elfish in localStorage
 *
 */
function store() {
    // Put the object into storage
    localStorage.setItem('elfish', JSON.stringify(window.elfish));
}


/**
 * Retrieves the entire window.elfish JSON from localStorage and puts
 * it as window.elfish.
 *
 * Proceeds with deleting the DOM in ".app" and remakes the DOM.
 *
 * Overwrites anything in window.elfish at the * moment of execution.
 *
 */
function retrieve() {
    // Retrieve the object from storage
    var retrievedObject = localStorage.getItem('elfish');
    window.elfish = JSON.parse(retrievedObject);

    reloadDataIntoDom();
}


/**
 * Should only be run on window.onload after load from localStorage,
 * however it causes no harm to run it.  It deletes the content of
 * .app and reloads from window.elfish.
 *
 */
function reloadDataIntoDom() {
    console.log(window.elfish);

    console.log("Emptying .app ... ");
    $(".specie").remove();

    console.log("Populating ... ");
    for (var s = 0; s < window.elfish.species.length; s++) {
        var sName = window.elfish.species[s].name;
        efGUI.domSpecie(s, sName);

        var groups = window.elfish.species[s].groups;

        for (var g = 0; g < groups.length; g++) {
            var gName = groups[g].name;
            efGUI.domGroup(g, gName, s);

            for (var e = 0; e < groups[g].efforts.length; e++) {
                var eName = groups[g].efforts[e].name;
                var value =  groups[g].efforts[e].value;

                efGUI.domEffort(e, eName, g, s, value, groups[g].efforts);
                console.log("\t\tAdded effort " + e + ": " + eName + " (" + value + ")");
                recomputeValues(s,g);
            }
            updatePlot(s,g);
        }
    }

    efGUI.renderTabs();

    if (window.elfish.species.length) {
        efGUI.showSpecie(window.elfish.visibleSpecies || 0);
    }

    // Updates the method selector, reflecting the stored value.
    var methodDropdown = document.getElementsByName("method")[0];
    var methodOptions = methodDropdown.getElementsByTagName("option");
    for (var i = 0; i < methodOptions.length; i++) {
        if (methodOptions[i].value == window.elfish.method)
            methodOptions[i].selected = true;
    }
}


/**
 * Clears local storage
 */
function clearLocalStorage() {
    console.log("Clearing local storage ... ");

    // TODO make backup copy

    // should we export to CSV?

    window.localStorage.removeItem("elfish");
    initiateStorage();
    $(".specie").remove();
    efGUI.renderTabs();
}

function getInputValue(sp, gr, ef) {
    var elt = getInput(sp,gr,ef);

    retVal = NaN;
    if (elt !== null) {
        retVal = elt.value;
    }
    return retVal;
}


function getInput(s,g,e) {
    var postfix = "-" + s + "-" + g + "-" + e;

    // TODO use JQuery instead of postfix on id of dom elts
    var key = "ci" + postfix;

    return document.getElementById(key);
}

function createNewSpecies () {
    // TODO fix species title/name
    window.elfish.species.push({name: "Art", groups: []});
    var sId = window.elfish.species.length-1;
    efGUI.domSpecie(sId, "Art", true);
    efGUI.renderTabs();
    efGUI.showSpecie(sId);
}

function createNewGroup (specie) {
    if (specie >= window.elfish.species.length || specie < 0) {
        throw new Error("specie must be exisiting id: 0 <= " + specie + " < " + window.elfish.species.length);
    }

    console.log("createNewGroup(" + specie + ")");

    var species = window.elfish.species[specie];
    var groups = species.groups;

    var newGroupId = groups.length;

    groups.push({name:"Group " + newGroupId, efforts: []});

    efGUI.domGroup(newGroupId, "Gruppe", specie);

    console.log("\tgroups: " + groups);

    populateGroupsWithEfforts();

    return newGroupId;
}


function populateGroupsWithEfforts() {
    var n = window.elfish.minimumNumbersOfEfforts;
    for (var s = 0; s < window.elfish.species.length; s++) {
        for (var g = 0; g < window.elfish.species[s].groups.length; g++) {
            var gr = window.elfish.species[s].groups[g];
            while (gr.efforts.length < n) {
                createNewEffortForGroup("", g, s);
            }
        }
    }
}


/**
 *  Creates a new effort for the given group.
 */
function createNewEffortForGroup (effortName, groupId, speciesId) {
    var group = window.elfish.species[speciesId].groups[groupId];

    if (!group) {
        console.error("Could not create effort: no group with id " + groupId);
        return;
    }

    console.log("createNewEffortForGroup(" + effortName + "," + groupId + ", " +
                speciesId + ")");

    if (!effortName) {
        console.log("Creating effort without predefined name");
        if (window.elfish.species.length === 0 ||
            window.elfish.species[0].groups.length === 0 ||
            window.elfish.species[0].groups[0].efforts.length === 0) {
            effortName = "Effort";
        } else {
            var firstName = window.elfish.species[0].groups[0].efforts[0].name;
            effortName = ElfishUtilFirstToken(firstName);
        }
    }

    // "Effort 3" --- if this is the third effort
    effortName += " " + (1+group.efforts.length);

    group.efforts.push({name: effortName, value: ""});
    efGUI.domEffort((group.efforts.length-1), effortName, groupId, speciesId, group.efforts);
}


/*
 document content manipulations
 */
function clearEst(postfix) {
    console.log("Clearing innerHTML");
    document.getElementById("est" + postfix).innerHTML = "---";
    document.getElementById("ke"  + postfix).innerHTML = "---";
    document.getElementById("te"  + postfix).innerHTML = "---";
}

function setEst(postfix, val) {
    document.getElementById("est" + postfix).innerHTML = "N̂ =" + val;
}

function setKe(postfix, val) {
    document.getElementById("ke" + postfix).innerHTML = "CI/N̂ =" + val;
}

function setTe(postfix, val) {
    document.getElementById("te" + postfix).innerHTML = "T/N̂ =" + val;
}

function getEst(postfix) {
    return document.getElementById("est" + postfix).innerHTML;
}
function getKe(postfix) {
    return document.getElementById("ke" + postfix).innerHTML;
}
function getTe(postfix) {
    return document.getElementById("te" + postfix).innerHTML;
}





/**
 *  Exports the content of window.elfish to a CSV string.
 *
 */
function exportCSV () {
    var csv = "";

    var species = window.elfish.species;
    for (var s = 0; s < species.length; s++) {
        var groups = species[s].groups;
        csv += species[s].name;
        for (var g = 0; g < groups.length; g++) {
            var efforts = groups[g].efforts;

            // INPUT
            csv += "\n" + groups[g].name;
            for (var e = 0; e < efforts.length; e++) {
                csv += "," + getInputValue(s,g,e);
            }

            // EST
            csv += "\n";
            for (var e = 0; e < efforts.length; e++) {
                // TODO instead of postfix id on dom element, do JQuery!
                var postfix = "-" + s + "-" + g + "-" + e;

                if (e <= 0)
                    csv += ",---";
                else
                    csv += "," + getEst(postfix);
            }

            // k/E
            csv += "\n";
            for (var e = 0; e < efforts.length; e++) {
                // TODO instead of postfix id on dom element, do JQuery!
                var postfix = "-" + s + "-" + g + "-" + e;

                if (e <= 0)
                    csv += ",---";
                else
                    csv += "," + getKe(postfix);
            }

            // T/E
            csv += "\n";
            for (var e = 0; e < efforts.length; e++) {
                // TODO instead of postfix id on dom element, do JQuery!
                var postfix = "-" + s + "-" + g + "-" + e;

                if (e <= 0)
                    csv += ",---";
                else
                    csv += "," + getTe(postfix);
            }
        }
        csv += "\n";
    }

    return csv;
}

function computeValue(s,g,e,vals) {
    var arr = [];
    var postfix = "-" + s + "-" + g + "-" + e;
    for (var i = 0; i < vals.length; i++) {
        var val = vals[i];
        if (val === "")
            arr.push(0);
        else
            arr.push(parseInt(val,10));
    }

    var estString = ElfishMathEstimateString(arr,window.elfish.method);
    console.log("picked method " + window.elfish.method + " :::: " + estString);

    setEst(postfix, estString);

    var ciSlashE = "---";
    var ciSlashEval = ElfishMathCIslashE(arr, window.elfish.method);
    if (ciSlashEval >= 0)
        ciSlashE = ciSlashEval.toFixed(3);
    setKe(postfix, ciSlashE);

    // T / E
    var tSlashE = "---";
    var tSlashEval = ElfishMathTSlashE(arr, window.elfish.method);
    if (tSlashEval >= 0)
        tSlashE = tSlashEval.toFixed(3);
    setTe(postfix, tSlashE);
    document.getElementById("est" + postfix).className = "est";

    // marking effort boxes as green when below given confidence
    var effortboxId = "effort-" + s + "-" + g + "-" + e;
    var effortbox = document.getElementById(effortboxId);
    if (ElfishMathIsConfident(arr, window.elfish.confidence,
                              window.elfish.method))
        effortbox.className = "effort confident";
    else
        effortbox.className = "effort";
}

function recomputeValues(s,g) {
    // the values for effort e in species s, group g changed,
    // recompute the entire group

    var specie = window.elfish.species[s];
    var group = specie.groups[g];
    var efforts = group.efforts;

    var vals = [];
    for (var e = 0; e < efforts.length; e++) {
        vals.push(getInputValue(s,g,e));

        if (e > 0) {
            // one effort is not enough.
            computeValue(s,g,e,vals);
        }
    }
    store();
    updateSummary(s,g);
}


function run () {
    $( ".app" )
        .delegate(".placeholder", "click", function (evtObj) {
            var groupParent = $($(evtObj.target).parents("[data-id]:first")[0]);
            var specieId = parseInt(groupParent.attr("data-specie-id"), 10);
            var groupId = parseInt(groupParent.attr("data-group-id"), 10);
            createNewEffortForGroup("", groupId, specieId);
            store();
        });

    $( ".app" )
        .delegate("button[data-button='group']", "click", function (evtObj) {
            var jqPar = $(evtObj.target).parent(".specie");
            var specieId = jqPar.data("species-id");
            createNewGroup(specieId);
            store();
        });

    $( ".app" )
        .delegate("button[data-button='species']", "click", function (evtObj) {
            createNewSpecies();
            store();
        });


    $( ".app" )
        .delegate(".editable", "click", function (evtObj) {
            console.log("Clicked editable");
            $(evtObj.target).attr('contenteditable','true');
            $(evtObj.target).focus();
        });



    //
    // Editing is done on header
    //
    $( ".app" )
        .delegate(".editable", "blur", function (evtObj) {
            $(evtObj.target).attr('contenteditable','false');

            console.log("Edit done on: " + $(evtObj.target).attr("data-edit-header"));

            switch ($(evtObj.target).attr("data-edit-header")) {
            case "effort":
                var sp = parseInt($(evtObj.target).attr("data-effort-header-specie"), 10);
                var gr = parseInt($(evtObj.target).attr("data-effort-header-group"), 10);
                var ef = parseInt($(evtObj.target).attr("data-effort-header-effort"), 10);

                var header = $(evtObj.target).text();
                // FIXME TODO got this error:
                // TypeError: window.elfish.species[sp].groups[gr].efforts[ef] is undefined elfish.js:377
                // where 377 used to be the line immediately below.
                // can this happen if we click on + or on the hidden effort-thing?
                window.elfish.species[sp].groups[gr].efforts[ef].name = header;
                break;

            case "group":
                var sp = parseInt($(evtObj.target).attr("data-group-header-specie"), 10);
                var gr = parseInt($(evtObj.target).attr("data-group-header-group"), 10);

                var header = $(evtObj.target).text();
                window.elfish.species[sp].groups[gr].name = header;
                break;

            case "specie":
                var sp = parseInt($(evtObj.target).attr("data-specie-header-specie"), 10);

                var header = $(evtObj.target).text();
                window.elfish.species[sp].name = header;
                efGUI.renderTabs();
                efGUI.showSpecie(sp);
                break;
            }
            store();
        });




    $('.app').on("keydown",'.editable', function(evtObj) {
        if (evtObj.key == "Enter") {
            console.log('disable edit for' + evtObj.target);
            $(evtObj.target).blur();
        } else if (evtObj.key == "Esc" || evtObj.key == "Escape" ) {
            // TODO reset to old innerHTML
            var sp = parseInt($(evtObj.target).attr("data-effort-header-specie"), 10);
            var gr = parseInt($(evtObj.target).attr("data-effort-header-group"), 10);
            var ef = parseInt($(evtObj.target).attr("data-effort-header-effort"), 10);
            var old = window.elfish.species[sp].groups[gr].efforts[ef].name;

            console.log('edit cancelled');
            $(evtObj.target).blur();

            window.elfish.species[sp].groups[gr].efforts[ef].name = old;
            var header = $(evtObj.target).text(old);
        }
    });

    store();

    $( ".app" )
        .delegate(".catch-input", "change", function (evtObj) {
            var val = evtObj.target.value;

            var s = parseInt($(evtObj.target).attr("data-input-species"), 10);
            var g = parseInt($(evtObj.target).attr("data-input-group"), 10);
            var e = parseInt($(evtObj.target).attr("data-input-effort"), 10);

            if (val === "")
                val = 0;
            else
                val = parseInt(val, 10);

            window.elfish.species[s].groups[g].efforts[e].value = val;

            recomputeValues(s,g);
            store();
            updatePlot(s,g);
        });

    $( ".app")
        .delegate(".tabs-list li:not(.new)", "click", function (e) {
            var specieId = $(e.currentTarget).data("specie-id");
            efGUI.showSpecie(specieId);
        });

    $( ".app")
        .delegate(".group-plot", "click", function (e) {
            $(e.currentTarget).find("canvas").toggle(200);
        });
}



function updateSummary (sp,gr) {
    var elt = $(".group-summary[data-group-id="+gr+"][data-specie-id="+sp+"]")[0];

    var groups = window.elfish.species[sp].groups[gr];
    var numOfEfforts = groups.efforts.length;
    var totalCatch = 0;

    var arr = [];

    for (var e = 0; e < numOfEfforts; e++) {
      var val = groups.efforts[e].value;
        eVal = 0;
        if (val !== "")
            eVal = parseInt(val, 10);
        totalCatch += eVal;
        arr.push(eVal);
    }

    var est = ElfishMathEstimateString(arr, window.elfish.method);
    console.log("SUMMARY method " + window.elfish.method + ": " + est);

    var data = "<p>Efforts = " + numOfEfforts + "</p>";
    data += "<p>N̂ = " + est + "</p>";
    data += "<p>T = " + totalCatch + "</p>";

    elt.innerHTML = data;
}


// same-ish as window.onload
$(function () {
    if (window.localStorage.getItem("elfish") === null) {
        console.log("No local storage, starting fresh ... ");
        initiateStorage();
        efGUI.renderTabs();
    } else {
        console.log("Has local storage, reloading ... ");
        retrieve();
    }
    run();
    updatePlot(0, 0);
});

function setMethod(mt) {
    if (mt == 1)
        window.elfish.method = "zippin";
    else
        window.elfish.method = "cs";

    console.log("Method: " + window.elfish.method);
    reloadDataIntoDom();
}
