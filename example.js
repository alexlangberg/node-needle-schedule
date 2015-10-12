var needleSchedule = require('./');

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
