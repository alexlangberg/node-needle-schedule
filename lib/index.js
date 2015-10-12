'use strict';

var R = require('ramda');
var nr = require('needle-retry');
var nodeSchedule = require('node-schedule');
var util = require('util');
var events = require('events');

/*
 * Gets default options and merges with user options if any.
 * @param options
 * @returns {*}
 */
var getDefaults = function(options) {
  var defaults = {
    'method': 'get',
    'data': null,
    'needleRetry': null,
    'rule': { 'second': 1 }
  };

  if (!options) {
    return defaults;
  }

  return R.merge(defaults, options);
};

var Schedule = function(targets, userOptions) {
  var self = this;
  self.jobs = [];
  self.running = 0;
  self.targets = targets;
  self.options = getDefaults(userOptions);

  events.EventEmitter.call(this);
  return self;
};

util.inherits(Schedule, events.EventEmitter);

/*
 * Start the scheduler
 */
Schedule.prototype.start = function() {
  var self = this;

  self.emit('start');

  R.forEach(function(target) {
    var options = R.merge(self.options, target);

    var job = nodeSchedule.scheduleJob(options.rule, function() {
      var timestamps = {
        'start': Date.now()
      };

      self.running++;
      self.emit('running', options, timestamps);

      nr.request(
        options.method,
        options.url,
        options.data,
        options.needleRetry,
        function(error, response, body) {
          self.running--;
          timestamps.end = Date.now();

          if (error) {
            self.emit('error', error, options, timestamps);
            return;
          }

          self.emit('response', response, body, options, timestamps);
        });
    });

    self.jobs.push(job);
  }, self.targets);
};

/*
 * stop the scheduler
 */
Schedule.prototype.stop = function() {
  var self = this;
  R.forEach(function(job) {
    job.cancel();
  }, self.jobs);

  self.emit('stop');
};

module.exports = function(targets, userOptions) {
  return new Schedule(targets, userOptions);
};
