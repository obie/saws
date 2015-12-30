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
    }
  }

  return aws;
}
