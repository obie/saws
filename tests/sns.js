var chai = require('chai');
var sinon = require("sinon");
chai.use(require("sinon-chai"));
var expect = chai.expect;

var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});

var Saws = new require('../lib/saws.js')(AWS);

Saws.stage = "test";

describe('SNSEvent', function() {
  it('should make it convenient to process incoming messages', function(done) {
    var e = new Saws.SNSEvent(require('./sns/event.js')); // sample event data
    e.each(function(message, payload) {
      expect(message.MessageId).to.equal("95df01b4-ee98-5cb9-9903-4c221d41eb5e");
      expect(payload.a).to.equal("foo");
    });
    done();
  });
});

describe('SNS pubishing', function() {
  var snsStub = sinon.stub(Saws.sns, 'createTopic');

  describe('new Topic', function() {
    it('tries to create a topic (in case it does not exist yet)', function(done) {
      var topic = new Saws.Topic("NewOrders");
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

      var publishStub = sinon.stub(Saws.sns, 'publish');
    
      var topic = new Saws.Topic("NewOrders");
      topic.publish({foo: "bar"});

      expect(publishStub).to.have.been.calledWith({
        TopicArn: topicArn,
        Message: "{\"foo\":\"bar\"}"
      });
      done();
    });
  });
});