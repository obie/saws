'use strict';

module.exports = function(Saws) {
  var sqs = new Saws.AWS.SQS();

  var Queue = function(url) {
    this.url = url;
  };

  Queue.prototype.publish = function(msg, cb) {
    sqs.sendMessage({
      QueueUrl: this.url,
      MessageBody: JSON.stringify(msg)
    }, cb);
  };

  return {
    Queue: Queue
  };
};
