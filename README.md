# node-needle-schedule
Schedule needle requests.

# node-needle-schedule
[![npm version](http://img.shields.io/npm/v/needle-schedule.svg)](https://www.npmjs.org/package/needle-schedule)
[![Build Status](http://img.shields.io/travis/alexlangberg/node-needle-schedule.svg)](https://travis-ci.org/alexlangberg/node-needle-schedule)
[![Dependency Status](https://david-dm.org/alexlangberg/node-needle-schedule.svg)](https://david-dm.org/alexlangberg/node-needle-schedule)
[![devDependency Status](https://david-dm.org/alexlangberg/node-needle-schedule/dev-status.svg)](https://david-dm.org/alexlangberg/node-needle-schedule#info=devDependencies)

Schedule [needle-retry](https://www.npmjs.org/package/needle-retry) requests using [node-schedule](https://www.npmjs.org/package/node-schedule).

## Installation
```
npm install needle-schedule
```

## Usage

```javascript
var needleSchedule = require('needle-schedule');
var ns = needleSchedule(targets, options);
ns.on('response', function(response) {
  console.log(response);
});
ns.start();
ns.stop();
```

## Parameters

### Targets
The first parameter required by the setup function is an array of targets. An example:
```javascript
[
  {
    url: 'https://github.com',
    rule: { second: [15, 35, 55] }
  }
]
```

```url``` is the only required parameter.
```rule``` is the schedule rule for [node-schedule](https://www.npmjs.org/package/node-schedule). In this case, 3 times a minute when second equals any of the three values (defaults to ```second: 1```, e.g. once a minute).
```needleRetry``` options passed on to [needle-retry](https://www.npmjs.org/package/needle-retry).

If no other options than ```url``` are set in the target, the defaults provided by the options parameter, explained below, will be used.

### Options
Options can be passed in as the second parameter. It can contain the default values for targets. For instance the defaults:

```javascript
var options = {
    'method': 'get',
    'data': null,
    'needleRetry': null,
    'rule': { 'second': 1 }
}
```

These options will be applied to all targets that do not explicitly define them themselves. Note that if no rule is provided, it defaults to ```second: 1```, e.g. once a minute.

### events
This module is an event emitter, that will emit events on start, stop, run, end and results. The results event will emit:

1. ```response``` - the response from needle-retry.
4. ```body``` - the raw body from needle-retry.
2. ```options``` - the options (and target) the results have been collected with.
3. ```timestamps``` - timestamps (```start``` and ```end```) of the request.

## Example
```javascript
var needleSchedule = require('needle-schedule');

// declare google.com a target
var targets = [
  {
    'url': 'https://google.com'
  }
];

// set up the schedule
var ns = needleSchedule(targets).start();

// receive the response
ns.on('response', function(response) {
  console.log(response);
});
```

## Advanced example
```javascript
var needleSchedule = require('needle-schedule');

// first will use default options below, second has custom options
var targets = [
  {
    'url': 'https://google.com'
  },
  {
    'url': 'https://github.com',
    'rule': { 'second': [15, 35, 55] }
  }
];

// default options
var options = {
  'rule': { 'second': [1, 10, 20, 30, 40, 50] }
};

// set up the schedule
var ns = needleSchedule(targets, options);

// receive the response
ns.on('response', function(response) {
  console.log(response);
});

// start the schedule
ns.start();

// stop the schedule after 60 seconds
setTimeout(function() {
  ns.stop();
}, 60000);
```
