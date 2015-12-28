var AWS = require('aws-sdk');
var Chainsaws = new require('../lib/chainsaws.js')(AWS);

Chainsaws.config.update({region:'us-east-1'});

describe('SNS functions', function() {
  describe('publish', function() {
    it('should put a message on a topic', function(done) {
      var topic = new Chainsaws.Topic("someTopicArn");
      topic.publish({foo: "bar"}, done);
    });
  });
});