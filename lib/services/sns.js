'use strict';
var _ = require('lodash');

module.exports = function(Saws) {
  var sns = new Saws.AWS.SNS();

  var Topic = function(name) {
    this.name = name;
    this.arn = null;
  };

  Topic.prototype.initialize = function(cb) {
    if(this.arn) {
      return cb(null, this.arn);
    }

    var self = this;

    sns.createTopic({Name: this.name + '-' + Saws.stage}, function(err, data) {
      Saws.DEBUG('sns.createTopic', err, data);

      if (!err) {
        self.arn = data.TopicArn;
      }

      if(cb) {
        cb(err, self.arn);
      }
    });
  };

  Topic.prototype.publish = function(msg, cb) {
    this.initialize(function(err, topicArn){
      if(err) {
        return cb(err);
      }

      sns.publish({
        TopicArn: topicArn,
        Message: JSON.stringify(msg)
      }, function(err, data) {
        Saws.DEBUG('sns.publish', err, data);
        cb(err, data);
      });
    });
  };

  var SNSEvent = function(sourceEvent) {
    this.sourceEvent = sourceEvent;
  };

  SNSEvent.prototype.eachMessage = function(cb) {
    return _.forEach(this.sourceEvent.Records, function(record) {
      cb(record.Sns, JSON.parse(record.Sns.Message));
    });
  };

  Saws.Topic = Topic;
  Saws.SNSEvent =  SNSEvent;
};
