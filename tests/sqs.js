var chai = require('chai');
var sinon = require("sinon");
chai.use(require("sinon-chai"));
var expect = chai.expect;

var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});

var Chainsaws = new require('../lib/chainsaws.js')(AWS);

describe('SQS functions', function() {
  describe('publish', function() {
    it('should put a message on a queue', function(done) {
      var publishStub = sinon.stub(Chainsaws.sqs, 'sendMessage', function(obj, cb) {cb()});
      var url = "someQueueUrl";

      var queue = new Chainsaws.Queue(url);
      queue.publish({foo: "bar"}, done);

      expect(publishStub).to.have.been.calledWith({
            QueueUrl: url,
            MessageBody: "{\"foo\":\"bar\"}"
          }, done);
    });
  });
});