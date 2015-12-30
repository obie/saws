var chai = require('chai');
var sinon = require("sinon");
chai.use(require("sinon-chai"));
var expect = chai.expect;

var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});

var Saws = new require('../lib/saws.js')(AWS);

describe('SQS functions', function() {
  describe('publish', function() {
    it('should put a message on a queue', function(done) {
      var publishStub = sinon.stub(Saws.sqs, 'sendMessage', function(obj, cb) {cb()});
      var url = "someQueueUrl";

      var queue = new Saws.Queue(url);
      queue.publish({foo: "bar"}, done);

      expect(publishStub).to.have.been.calledWith({
            QueueUrl: url,
            MessageBody: "{\"foo\":\"bar\"}"
          }, done);
    });
  });
});