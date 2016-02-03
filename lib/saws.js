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
  fs.readdirSync(path.join(__dirname, "services")).forEach(function(file) {
    var submodule = require('./services/' + file)(self);

    Object.getOwnPropertyNames(submodule).forEach(function(submoduleName) {
      self.DEBUG('Autoloading ' + submoduleName);
      self[submoduleName] = submodule[submoduleName];
    });
  });

  return this;
};

module.exports = {
  Saws: Saws,
  AWSStub: require('../tests/aws-stub')
};
