'use strict';

var test = require('tape');
var sinon = require('sinon');
var needle = require('../');

var options = {
  'rule': {'second': 1},
  'needleRetry': {
    'needle': {
      'follow_max': 20
    },
    'retry': {
      'retries': 0
    }
  }
};

var targets = [
  {'url': 'http://google.com'}
];

var clock;

function setClock() {
  clock = sinon.useFakeTimers();
}

function restoreClock() {
  clock.restore();
}

test('it loads without options', function(t) {
  needle(targets);
  t.end();
});

test('it accepts options', function(t) {
  needle(targets, options);
  t.end();
});

test('it passes down options', function(t) {
  var ns = needle(targets, options);

  t.plan(1);

  t.true(ns.options.needleRetry);
});

test('it runs and stops', function(t) {
  var ns = needle(targets, options);
  var emitter = sinon.spy(ns, 'emit');

  t.plan(5);
  setClock();

  ns.on('response', function(response) {
    ns.stop();

    t.equal(response.statusCode, 200);
    t.equal(emitter.getCall(0).args[0], 'start');
    t.equal(emitter.getCall(1).args[0], 'running');
    t.equal(emitter.getCall(3).args[0], 'response');
    t.equal(emitter.getCall(4).args[0], 'stop');

    restoreClock();
  });

  ns.start();
  clock.tick(61000);
});

test('it runs with custom options for target', function(t) {
  var targets = [
    {
      'url': 'http://google.com',
      'rule': {'second': 2}
    }
  ];
  var ns = needle(targets, options);

  t.plan(4);
  setClock();

  ns.on('response', function(response, body, options, timestamps) {
    ns.stop();

    t.equal(options.rule.second,  2);
    t.equal(response.statusCode, 200);
    t.equal(timestamps.start, 62000);
    t.equal(timestamps.end, 63000);

    restoreClock();
  });

  ns.start();
  clock.tick(63000);
});

test('it returns error on needle-retry failure', function(t) {
  var targets = [
    {'url': 'foo'}
  ];
  var ns = needle(targets, options);

  t.plan(3);
  setClock();

  ns.on('error', function(error, options, timestamps) {
    ns.stop();

    t.true(error);
    t.equal(targets[0].url, options.url);
    t.true(timestamps);

    restoreClock();
  });

  ns.start();
  clock.tick(61000);
});
