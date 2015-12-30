var chai = require('chai');
var sinon = require("sinon");
chai.use(require("sinon-chai"));
var expect = chai.expect;

var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});

var Chainsaws = new require('../lib/chainsaws.js')(AWS);

Chainsaws.stage = "test";

describe('SNS functions', function() {
  var snsStub = sinon.stub(Chainsaws.sns, 'createTopic');

  describe('new Topic', function() {
    it('tries to create a topic (in case it does not exist yet)', function(done) {
      var topic = new Chainsaws.Topic("NewOrders");
      topic.publish("whatever"); // topic creation is lazy

      expect(snsStub).to.have.been.calledWith({
        Name: "NewOrders-test"
      });
      done();
    });
  });

  describe('publish', function() {
    it('should put a message on a topic', function(done) {
      var topicArn = "arn:aws:sns:us-east-1:501293600930:NewOrders-development";
      snsStub.callsArgWith(1, null, {TopicArn: topicArn});

      var publishStub = sinon.stub(Chainsaws.sns, 'publish');
    
      var topic = new Chainsaws.Topic("NewOrders");
      topic.publish({foo: "bar"});

      expect(publishStub).to.have.been.calledWith({
        TopicArn: topicArn,
        Message: "{\"foo\":\"bar\"}"
      });
      done();
    });
  });
});