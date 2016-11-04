var co = require('co');
var StateMachine = require('./index');

var sm = new StateMachine();

function foo(cb) {
  console.log("foo");
  setTimeout(function() {
    console.log("foo timeout");
    cb(bar);
  }, 1000);             
}

function bar(cb) {
  console.log("bar");
  cb();
}

function baz(cb) {
  console.log("baz");
  cb();
}

function goo(cb) {
  console.log("goo");
  cb();
}

setTimeout(function() {
  sm.set_interrupt_state(baz);
}, 500);

setTimeout(function() {
  sm.set_interrupt_state(foo);
}, 6000);


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
