'use strict';

module.exports = function(AWS) {
  this.AWS = AWS;
  this.stage = 'development';

  this.DEBUG = function() {
    if(process.env.SAWS_DEBUG)
      console.log.apply(console, arguments);
  };

  // TODO: Make this dynamic
  require('./sns')(this);
  require('./dynamo')(this);
  require('./sqs')(this);

  return this;
};
