'use strict';
var fs = require('fs');
var path = require('path');

var Saws = function(AWS) {
  this.AWS = AWS;
  this.stage = 'development';
  var self = this;

  // Load all files from ./services
  fs.readdirSync(path.join(__dirname, "services")).forEach(function(file) {
    require('./services/' + file)(self);
  });

  return this;
};

Saws.prototype.DEBUG = function() {
  if(process.env.SAWS_DEBUG) {
    console.log.apply(console, arguments);
  }
};

module.exports = {
  Saws: Saws,
  AWSStub: require('../tests/aws-stub')
};
