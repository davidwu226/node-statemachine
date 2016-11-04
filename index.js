var co = require('co');

function StateMachine(interval) {

  this.state = undefined;
  this.next_state = undefined;
  this.interrupt_state = undefined;
  this.running = false;
  this.started = false;
  this.immediate_next_state = true;
  this.defined_states = {};
}

StateMachine.prototype.set_immediate = function(enable) {
  this.immediate_next_state = enable;
};
  
StateMachine.prototype.start = function(interval) {
  if (!this.started) {
    this.interval = interval || 2000;
    var self = this;
    this.started = true;
    this.interval_id = setInterval(function() {
      self.timeout();
    }, this.interval);
    this.run_next_state();
  }
};

StateMachine.prototype.stop = function() {
  if (this.started) {
    clearInterval(this.interval_id);
    delete this.interval_id;
    this.running = false;
  } 
};

StateMachine.prototype.timeout = function() {
  if (!this.running) {
    this.run_next_state();
  }
};

StateMachine.prototype.set_next_state = function(state) {
  if (typeof(state) == 'string') {
    state = this.defined_states[state];
  }
  
  this.next_state = state;
  if (!this.running) {
    this.run_next_state();
  }
};

StateMachine.prototype.set_interrupt_state = function(state) {
  if (typeof(state) == 'string') {
    state = this.defined_states[state];
  }
  
  this.interrupt_state = state;
  if (!this.running) {
    this.run_next_state();
  }
};

StateMachine.prototype.run_next_state = function() {
  this.state = this.next_state;
  this.next_state = undefined;
  if (this.interrupt_state != undefined) {
    this.state = this.interrupt_state;
    this.interrupt_state = undefined;
  }  
  if (this.state != undefined) {
    var self = this;
    this.running = true;
    this.immediate_next_state = true;
    this.state(function(next_state) {
      self.running = false;
      if (next_state != undefined) {
        if (typeof(next_state) == 'string') {
          next_state = self.defined_states[next_state];
        }
        self.next_state = next_state;
      }
      if (self.immediate_next_state) {
        self.run_next_state();
      }
    });
  }
};

StateMachine.prototype.define_state = function(state, gen) {

  var f = gen || state;

  if (isGeneratorFunction(f)) {
    var g = f;

    f = function(cb) {
      co(g).then(function() {
        cb();
      });
    };
  }

  if (typeof(state) == 'string') {
    this.defined_states[state] = f;
  }

  return f;
};

function isGenerator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

function isGeneratorFunction(obj) {
  var constructor = obj.constructor;
  if (!constructor) return false;
  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;
  return isGenerator(constructor.prototype);
}

module.exports = StateMachine;
