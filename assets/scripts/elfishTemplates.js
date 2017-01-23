efGUI.domSpecie = function (specieId, specieName) {
    $(".data:first").loadFromTemplate({
        template:$("#template-specie").html(),
        data: {
            specie: {
                id: specieId,
                title: specieName
            }
        }
    });
    console.log("added new species, " + specieId, ": " + specieName);
};

efGUI.domGroup = function (groupId, groupName, specieId) {
    var selector = ".specie-groups[data-species-id=" + specieId + "]";
    $(selector).loadFromTemplate({
        template:$("#template-group").html(),
        data: {
            group: {
                id: groupId,
                title: groupName,
                specieid: specieId
            }
        }
    });
};


efGUI.domEffort = function (effortId, effortName, groupId, specieId, value, efforts) {
    var gEfforts = $(".group-efforts[data-id=group-"+ groupId +"][data-specie-id="+specieId+"] .group-efforts-inner");
    var placeholder = gEfforts.children(".placeholder");

    if (typeof value === "undefined") {
        value = "";
    }

    // check if there's an effort placeholder at the end
    // add it if it does not exist
    if (placeholder.length === 0) {
        console.log("Found no placeholder in", groupId, "for specie", specieId, "so adding it.");
        gEfforts.loadFromTemplate({
            template:$("#template-effort").html(),
            data: {
                effort: {
                    id: "",
                    title: "New effort",
                    groupid: groupId,
                    specieid: specieId,
                    est: "----",
                    ke: "----",
                    te: "----",
                    value: "",
                    extraClasses: ["placeholder"]
                }
            }
        });
        placeholder = gEfforts.children(".placeholder");
    }

    // insert new effort before placeholder
    var t = Handlebars.compile($("#template-effort").html());
    var d = {
        effort: {
            id: effortId,
            title: effortName,
            groupid: groupId,
            specieid: specieId,
            est: "----",
            ke: "----",
            te: "----",
            value: value,
            extraClasses: ["new-effort"]
        }
    };
    var jqEffort = $(t(d));

    // renders template and makes jquery outta it,
    // then inserts it before a placeholder
    jqEffort.insertBefore(placeholder);

    window.setTimeout(function () {
        var d = jqEffort;
        d.removeClass("new-effort");
    }, 1);

    // TODO: un hard code this value
    gEfforts.width(gEfforts.children(".effort").size() * 230);
};

efGUI.showSpecie = function (specieId) {
    console.log("showSpecie", specieId);
    var s = $(".specie[data-species-id=" + specieId + "]:first");

    $(".specie").removeClass("visible");

    if (s.length === 0) {
        throw new Error("Cannot show specie " + specieId + ", does not exist");
    }
    s.addClass("visible");

    $(".tabs-list li").removeClass("active");
    $(".tabs-list li[data-specie-id="+specieId+"]:first").addClass("active");

    // TODO: should not be done here, move to controller
    window.elfish.visibleSpecies = specieId;
    store();
};

efGUI.renderTabs = function () {
    var t = $(".tabs:first");
    t.empty();
    t.loadFromTemplate({
        template: $("#template-tabs").html(),
        data: {
            species: window.elfish.species
        }
    });
};
