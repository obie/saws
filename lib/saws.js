var AWS;

function DEBUG() {
  if(process.env.SAWS_DEBUG)
    console.log.apply(console, arguments)
}

module.exports = function(AWS) {
  var self = {
    stage: "development",

    sns: new AWS.SNS(),

    Topic: function(name) {
      function initializeTopic(cb) {
        var topicArn; // memoized
        if(topicArn) {
          cb(null, topicArn);
        }
        else {
          self.sns.createTopic({Name: name + '-' + self.stage}, function(err, data) {
            DEBUG("sns.createTopic", err, data);
            if(cb) {
              cb(err, data.TopicArn);
            }
            topicArn = data.TopicArn;
          });
        }
      }

      return {
        publish: function(msg, cb) {
          initializeTopic(function(err, topicArn){
            if(!err) {
              self.sns.publish({
                TopicArn: topicArn,
                Message: JSON.stringify(msg)
              }, function(err, data) {
                DEBUG("sns.publish", err, data);
                cb(err, data);
              });
            }
          });
          
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
