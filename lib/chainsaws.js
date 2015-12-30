var AWS;

module.exports = function(AWS) {
  var aws = {
    sns: new AWS.SNS(),

    Topic: function(topicArn) {
      return {
        publish: function(msg, cb) {
          aws.sns.publish({
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
          aws.sqs.sendMessage({
            QueueUrl: url,
            MessageBody: JSON.stringify(msg)
          }, cb);
        }
      }
    }

  }

  return aws;
}
