// jshint mocha: true
'use strict';
var chai = require('chai');
var sinon = require("sinon");
chai.use(require("sinon-chai"));
var expect = chai.expect;
var AWSStub = require('./aws-stub');

function FakeSaws() {
    var fake = {
      stage: 'test',
      DEBUG: sinon.stub(),
      AWS: new AWSStub()
    };
    var submodule = require('../lib/services/sqs')(fake);
    fake.Queue = submodule.Queue;

    return fake;
}

describe('SQS functions', function() {

  describe('publish', function() {
    it('should put a message on a queue', function(done) {
      var fakeSaws = FakeSaws();
      fakeSaws.AWS.SQS.prototype.sendMessage = sinon.stub().callsArgWith(1, null, {MessageId: 'id00001'});
      var url = "someQueueUrl";
      var queue = new fakeSaws.Queue(url);

      queue.publish({foo: "bar"}, function(err, dajjta) {
        expect(fakeSaws.AWS.SQS.prototype.sendMessage).to.have.been.calledWith({
          QueueUrl: url,
          MessageBody: JSON.stringify({foo: "bar"})
        });
        done();
      });
    });
  });
});
