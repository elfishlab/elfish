
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

window.elfish = {data: {}}

function PersistantData() {
}

PersistantData.prototype.getId = function() {
    return this.id
}

PersistantData.prototype.getData = function() {
    return this.data
}

PersistantData.prototype.save = function() {
    this.data["id"] = this.getId();
    window.elfish.data[this.getId()] = this.getData()
    console.log("data now", window.elfish.data)
}

function Effort() {
    PersistantData.call(this);
}

Effort.prototype = Object.create(PersistantData.prototype);
Effort.prototype.constructor = Effort;

Effort.prototype.setVal = function(val) {
    this.val = val;
}

Effort.prototype.getVal = function() {
    return this.val;
}

Effort.prototype.setOrder = function(val) {
    this.order = val;
}

Effort.prototype.getOrder = function() {
    return this.order;
}

Effort.prototype.save = function() {
    this.data = {
      order: this.order,
      val: this.val
    }
    PersistantData.prototype.save.call(this)
}


function Group() {
    PersistantData.call(this);
    this.data["efforts"] = [];
}
Group.prototype = Object.create(PersistantData.prototype);
Group.prototype.constructor = Group;

Group.prototype.addEffort = function(effort) {
  if (!window.elfish.data[effort.getId()]) {
      throw new Error("Effort " + effort.getId() + " was not saved.");
  }
  this.efforts.push(effort.getId())
}

Group.prototype.getEfforts = function() {
    ret = [];
    effortIds = this.efforts;
    for (var i = 0; i < effortIds.length; i++) {
        ret.push(window.elfish.data[effortIds[i]]);
    }
    return ret;
}

Group.prototype.save = function() {
    this.data = {
      efforts: this.efforts
    }
    PersistantData.prototype.save.call(this)
}

function NewEffort() {
    return Object.create(Effort.prototype, {
      data: {
        writable: true,
        value: {}
      },
      val: {
        writable: true,
        value: ""
      },
      order: {
        writable: true,
        value: ""
      },
      id: {
        writable: false,
        value: guid()
      }
  });
}

function NewGroup() {
    return Object.create(Group.prototype, {
        data: {
          writable: true,
          value: {}
        },
        efforts: {
          writable: true,
          value: []
        },
        id: {
          writable: false,
          value: guid()
        }
    });
}

var e = NewEffort();
// console.log(e.getId())
e.setVal(17)
e.save()

var g = NewGroup();
// console.log(g)
g.addEffort(e);
console.log(g.getEfforts())
g.save();
