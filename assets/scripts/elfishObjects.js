function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

window.elfish = {data: {}, history: []};

function PushHistory(fn) {
    window.elfish.history.push(fn);
}

function PersistentObject() {
    console.info("Initialized new persistent object: ", this._id());
}

PersistentObject.prototype._id = function() {
    return this.id
}

PersistentObject.prototype._getData = function() {
    return this.data
}

PersistentObject.prototype._save = function() {
    this.data["id"] = this._id();
    window.elfish.data[this._id()] = this._getData();
    return this;
}

PersistentObject.prototype._remove = function() {
    var e = window.elfish.data[this._id()];
    if (!e) {
        console.info("removing unsaved item has no effect");
        return;
    }
    window.elfish.data[this._id()] = null;
    delete window.elfish.data[this._id()];
    return this;
}

function _newPersistentObject(proto, id, data) {
    if (!id) {
        id = guid();
    }
    if (!data) {
        data = {};
    }
    var o = Object.create(proto, {
        data: {
            writable: true,
            value: data
        },
        id: {
            writable: true,
            value: id
        }
    });
    o.constructor.call(o);
    return o;
}

function App() {
    PersistentObject.call(this);
    log.info("Creating new Elfish app.");
}

function Effort() {
    PersistentObject.call(this);
}

Effort.get = function(effortId) {
    var e = window.elfish.data[effortId];
    if (!e) {
        throw new Error("Effort " + effortId + " dit not exist.");
    }
    return _newPersistentObject(Effort.prototype, effortId, e);
}

Effort.new = function() {
    return _newPersistentObject(Effort.prototype);
}

Effort.prototype = Object.create(PersistentObject.prototype);
Effort.prototype.constructor = Effort;

Effort.prototype.setVal = function(val) {
    PushHistory(function(v){
        this.data["val"] = v;
    }.bind(this, this.getVal()));

    this.data["val"] = val;
    return this;
}

Effort.prototype.getVal = function() {
    return this.data["val"];
}

Effort.prototype.setOrder = function(order) {
    this.data["order"] = order;
    return this;
}

Effort.prototype.getOrder = function() {
    return this.data["order"];
}

Effort.prototype._save = function() {
    return PersistentObject.prototype._save.call(this);
}

function Group() {
    PersistentObject.call(this);
    if (!this.data["efforts"]) {
        this.data["efforts"] = [];
    }
}

Group.get = function(groupId) {
    var g = window.elfish.data[groupId];
    if (!g) {
        throw new Error("Group " + groupId + " did not exist.");
    }
    return _newPersistentObject(Group.prototype, groupId, g);
}

Group.new = function() {
    return _newPersistentObject(Group.prototype);
}

Group.prototype = Object.create(PersistentObject.prototype);
Group.prototype.constructor = Group;

Group.prototype._registerEffort = function(effort) {
  if (!window.elfish.data[effort._id()]) {
      throw new Error("Effort " + effort._id() + " was not saved.");
  }

  this.data["efforts"].push(effort._id())
  return this;
}

Group.prototype._unregisterEffort = function(effort) {
  if (!window.elfish.data[effort._id()]) {
      throw new Error("Effort " + effort._id() + " was not saved.");
  }

  this.data["efforts"].splice(this.data["efforts"].indexOf(effort._id()), 1);
  return this;
}

Group.prototype._getEfforts = function() {
    ret = [];
    effortIds = this.data["efforts"];
    for (var i = 0; i < effortIds.length; i++) {
        ret.push(Effort.get(effortIds[i]));
    }
    return ret;
}

Group.prototype.CreateEffort = function() {
    var e = Effort.new().setOrder(this.data["efforts"].length)._save();

    PushHistory(function(effort) {
        this._unregisterEffort(effort);
        effort._remove();
    }.bind(this, e));

    this._registerEffort(e)._save();
    return e;
}

Group.prototype.RemoveEffort = function(effort) {
    var e = Effort.get(effort._id());
    this._unregisterEffort(e);
    e._remove();

    PushHistory(function(restoredEffort) {
        restoredEffort._save();
        this._registerEffort(restoredEffort);
    }.bind(this, e));

    return this;
}

Group.prototype._save = function() {
  return PersistentObject.prototype._save.call(this);
}

Group.prototype.MoveEffortToGroup = function(effort, group) {
    this._unregisterEffort(effort);
    group._registerEffort(effort);
    
    PushHistory(function(to, effort) {
        this._unregisterEffort(effort);
        to._registerEffort(effort);
    }.bind(group, this, effort));
}
