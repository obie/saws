'use strict';
var _ = require('lodash');

module.exports = function(Saws) {
  var Topic = function(name) {
    this.name = name;
    this.arn = null;
  };

  Topic.prototype.initialize = function(cb) {
    if(this.arn) {
      cb(null, this.arn);
    }
    else {
      var self = this;

      Topic.SNS.createTopic({Name: this.name + '-' + Saws.stage}, function(err, data) {
        Saws.DEBUG('sns.createTopic', err, data);
        self.arn = data.TopicArn;

        if(cb) {
          cb(err, data.TopicArn);
        }
      });
    }
  };

  Topic.prototype.publish = function(msg, cb) {
    this.initialize(function(err, topicArn){
      if(!err) {
        Topic.SNS.publish({
          TopicArn: topicArn,
          Message: JSON.stringify(msg)
        }, function(err, data) {
          Saws.DEBUG('sns.publish', err, data);
          cb(err, data);
        });
      }
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

  Topic.SNS = new Saws.AWS.SNS();

  return {
    Topic: Topic,
    SNSEvent: SNSEvent
  };
};
