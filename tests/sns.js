var chai = require('chai');
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
var expect = chai.expect;

var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});

var Chainsaws = new require('../lib/chainsaws.js')(AWS);

describe('SNS functions', function() {
  describe('publish', function() {
    it('should put a message on a topic', function(done) {
      var publishStub = sinon.stub(Chainsaws.sns, 'publish', function(obj, cb) {cb()});
      var topicArn = "someTopicArn";
      var topic = new Chainsaws.Topic(topicArn);
      topic.publish({foo: "bar"}, done);

      expect(publishStub).to.have.been.calledWith({
            TopicArn: topicArn,
            Message: "{\"foo\":\"bar\"}"
          }, done);
    });
  });
});