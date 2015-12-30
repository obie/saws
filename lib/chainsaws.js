var AWS;

module.exports = function(AWS) {
  var self = {
    stage: "development",

    sns: new AWS.SNS(),

    Topic: function(name) {
      var topicArn;
      self.sns.createTopic({Name: name + '-' + self.stage}, function(err, data) {
        topicArn = data.TopicArn;
      });
      return {
        publish: function(msg, cb) {
          self.sns.publish({
            TopicArn: topicArn,
            Message: JSON.stringify(msg)
          }, cb);
        }
      }
    },

    sqs: new AWS.SQS(),

    Queue: function(url) {
      return {
        publish: function(msg, cb) {
          self.sqs.sendMessage({
            QueueUrl: url,
            MessageBody: JSON.stringify(msg)
          }, cb);
        }
      }
    }

  }

  return self;
}
