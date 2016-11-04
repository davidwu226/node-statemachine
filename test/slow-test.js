var co = require('co');
var StateMachine = require('../index');

var sm = new StateMachine();

sm.define_state('COTEST1', function* () {
  console.log("hello");
  yield promiseTimeout(1000);
  console.log("hello again");
  yield promiseTimeout(1000);
  console.log("goodbye");
  sm.set_immediate(false);
  sm.set_next_state('GOO');
});                              

sm.define_state('BAR', function(cb) {
  console.log("hello");
  
  setTimeout(function() {
    console.log("goodbye");
    sm.set_immediate(false);
    sm.set_next_state('BAZ');    
    cb();
  }, 1000);
});
                
sm.define_state('GOO', function(cb) {
  console.log("goo");
  sm.set_immediate(false);
  cb('BAR');
});

sm.define_state('BAZ', function(cb) {
  console.log("baz");
  sm.set_immediate(false);
  cb();
});

sm.define_state('FOO', function(cb) {
  console.log("foo");
  sm.set_immediate(false);
  cb();
});
                
function promiseTimeout(timeout) {
  return new Promise(function(resolve) {
    setTimeout(function() { resolve(); }, timeout);
  });
}


sm.start();
sm.set_next_state('COTEST1');
setTimeout(function() {
  sm.set_interrupt_state('FOO');
}, 5000);

