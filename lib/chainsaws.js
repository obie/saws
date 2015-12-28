var AWS;

module.exports = function(AWS) {
  return {
    config: AWS.config,

    Topic: function(topicArn) {
      var sns = new AWS.SNS();

      return {
        publish: function(msg, cb) {
          sns.publish({
            TopicArn: topicArn,
            Message: JSON.stringify(msg)
          }, cb);
        }
      }
    }
  }
}
