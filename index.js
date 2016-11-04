var co = require('co');

function StateMachine(interval) {

  this.state = undefined;
  this.next_state = undefined;
  this.interrupt_state = undefined;
  this.running = false;
  this.started = false;
}

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
  this.next_state = state;
  if (!this.running) {
    this.run_next_state();
  }
};

StateMachine.prototype.set_interrupt_state = function(state) {
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
    this.state(function(next_state) {
      self.running = false;
      if (next_state != undefined) {
        self.next_state = next_state;
      }
      self.run_next_state();
    });
  }
};

StateMachine.prototype.define_state = function(gen) {
  return function(cb) {
    co(gen).then(function() {
      cb();
    });
  };
};

module.exports = StateMachine;
