'use strict';
var fs = require('fs');
var path = require('path');

module.exports = function(AWS) {
  this.AWS = AWS;
  this.stage = 'development';

  this.DEBUG = function() {
    if(process.env.SAWS_DEBUG)
      console.log.apply(console, arguments);
  };

  var self = this;
  // Load all files from ./services
  fs.readdirSync(path.join(__dirname, "services")).forEach(function(file) {
    var submodule = require('./services/' + file)(self);

    Object.getOwnPropertyNames(submodule).forEach(function(submoduleName) {
      console.log('Adding ' + submoduleName, submodule[submoduleName]);
      self[submoduleName] = submodule[submoduleName];
    });
  });

  return this;
};
