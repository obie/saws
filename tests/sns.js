// jshint mocha: true
'use strict';
var chai = require('chai');
var sinon = require("sinon");
var expect = chai.expect;

var AWSStub = require('./aws-stub');

chai.use(require("sinon-chai"));
chai.use(require("dirty-chai"));

function FakeSaws() {
    var fake = {
      stage: 'test',
      DEBUG: sinon.stub(),
      AWS: new AWSStub()
    };

    fake.AWS.SNS.prototype.createTopic = sinon.stub().callsArgWith(1, null, {TopicArn: 'fake:arn'});
    require('../lib/services/sns')(fake);

    return fake;
}

describe('SNSEvent', function() {
  var fakeSaws = FakeSaws();

  it('should make it convenient to process incoming messages', function(done) {
    var e = new fakeSaws.SNSEvent(require('./sns/event.js')); // sample event data
    e.eachMessage(function(message, payload) {
      expect(message.MessageId).to.equal("95df01b4-ee98-5cb9-9903-4c221d41eb5e");
      expect(payload.a).to.equal("foo");
    });
    done();
  });
});

describe('SNS publishing', function() {
  describe('new Topic', function() {
    it('tries to create a topic (in case it does not exist yet)', function(done) {
      var fakeSaws = FakeSaws();
      fakeSaws.AWS.SNS.prototype.publish = sinon.stub().callsArgWith(1, null, done);
      var topic = new fakeSaws.Topic("NewOrders");

      topic.publish("whatever", function(err, data) {
          expect(fakeSaws.AWS.SNS.prototype.createTopic).to.have.been.calledWith({
            Name: "NewOrders-test"
          });
          expect(topic.arn).to.exist();
          delete fakeSaws.AWS.SNS.prototype.publish;
          done();
      });
    });
  });

  describe('publish', function() {
    it('should put a message on a topic', function(done) {
      var fakeSaws = FakeSaws();
      fakeSaws.AWS.SNS.prototype.publish = sinon.stub().callsArgWith(1, null, done);

      var topic = new fakeSaws.Topic("NewOrders");
      // Set the topic as having already been created
      topic.arn = "arn:aws:sns:us-east-1:501293600930:NewOrders-development";
      topic.publish({foo: "bar"}, function(err, data) {
        expect(fakeSaws.AWS.SNS.prototype.publish).to.have.been.calledWith({
          TopicArn: topic.arn,
          Message: JSON.stringify({foo: "bar"})
        });

        expect(fakeSaws.AWS.SNS.prototype.createTopic).to.not.have.been.called();
        done();
      });
    });
  });
});
