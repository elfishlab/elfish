QUnit.module("Data objects tests", {
    beforeEach: function() {
        window.elfish = {data: {}, history: []};
    }
});

QUnit.test("New Effort", function(assert) {
    assert.ok(Effort.new());
});

QUnit.test("Effort.getVal", function(assert) {
    var e = Effort.new();
    e.setVal(17);
    assert.equal(17, e.getVal());
});

QUnit.test("Undo Effort.setVal", function(assert) {
    var e = Effort.new();
    e.setVal(17);
    e.setVal(18);

    Undo();
    assert.equal(e.getVal(), 17);

    Undo();
    assert.equal(e.getVal(), null);
});

QUnit.test("Effort.getOrder", function(assert) {
    var e = Effort.new();
    e.setOrder(3);
    assert.equal(3, e.getOrder());
});

QUnit.test("Effort.get", function(assert) {
    var e = Effort.new();
    e.setOrder(1);
    e._save();
    var getE = Effort.get(e._id());

    assert.equal(e._id(), getE._id());
    assert.equal(e.getOrder(), getE.getOrder());
    assert.equal(e.getVal(), getE.getVal());
});

QUnit.test("Remove Effort", function(assert) {
    var e = Effort.new()._save()._remove();
    
    assert.equal(null, window.elfish.data[e._id()]);
});

QUnit.test("New Group", function(assert) {
    assert.ok(Group.new());
});

QUnit.test("Manage Group Efforts", function(assert) {
    var g = Group.new();
    g.CreateEffort();

    assert.equal(1, g._getEfforts().length);
    assert.equal(g._getEfforts()[0].getOrder(), 0);
});

QUnit.test("Undo Remove Effort", function(assert) {
    var g = Group.new();
    var e = g.CreateEffort();
    g.RemoveEffort(e);

    Undo();

    assert.equal(g._getEfforts().length, 1);
});

QUnit.test("Group.get", function(assert) {
    var g = Group.new()._save();
    g.CreateEffort();

    var getG = Group.get(g._id());
    assert.equal(getG._getEfforts()[0]._id(), g._getEfforts()[0]._id());
});

QUnit.test("Undo Create Effort", function(assert) {
    var g = Group.new();
    var e = g.CreateEffort();

    Undo();

    assert.equal(g._getEfforts().length, 0);
});

QUnit.test("Move Effort", function(assert) {
    var g = Group.new();
    var g1 = Group.new();
    var e = g.CreateEffort();

    g.MoveEffortToGroup(e, g1);

    assert.equal(g._getEfforts().length, 0);
});

QUnit.test("Undo Move Effort", function(assert) {
    var g = Group.new();
    var g1 = Group.new();
    var e = g.CreateEffort();
    g.MoveEffortToGroup(e, g1);
    assert.equal(g._getEfforts().length, 0);

    Undo();

    assert.equal(g._getEfforts().length, 1);
});

