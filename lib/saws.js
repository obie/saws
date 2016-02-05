'use strict';
var fs = require('fs');
var path = require('path');

var Saws = function(AWS) {
  this.AWS = AWS;
  this.stage = 'development';

  this.DEBUG = function() {
    if(process.env.SAWS_DEBUG) {
      console.log.apply(console, arguments);
    }
  };

  var self = this;

  // Load all files from ./services
  var files = fs.readdirSync(path.join(__dirname, "services"));
  files = files.filter(function(filename) {
    return path.extname(filename) === '.js';
  }, files);

  files.forEach(function(file) {
    require('./services/' + file)(self);
  });

  return this;
};

module.exports = {
  Saws: Saws,
  AWSStub: require('../tests/aws-stub')
};
