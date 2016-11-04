var co = require('co');
var StateMachine = require('../index');

var sm = new StateMachine();

var cotest1 = sm.define_state(function* () {
  console.log("hello");
  yield promiseTimeout(1000);
  console.log("hello again");
  yield promiseTimeout(1000);
  console.log("goodbye");
  sm.set_next_state(goo);
});                              

function promiseTimeout(timeout) {
  return new Promise(function(resolve) {
    setTimeout(function() { resolve(); }, timeout);
  });
}


sm.start();
sm.set_next_state(cotest1);
