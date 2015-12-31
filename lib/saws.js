var _ = require('lodash');
var DOC = require("dynamodb-doc");

var AWS;

function DEBUG() {
  if(process.env.SAWS_DEBUG)
    console.log.apply(console, arguments)
}

module.exports = function(AWS) {
  var self = {
    stage: "development",

    ddb: new AWS.DynamoDB(),
    doc: new DOC.DynamoDB(this.ddb),

    // Simplest case, the first argument is the name of the table,
    // the second is an object with at least a key_schema key.
    Table: function(opts) {
      var created;
      var status;
      var tableName = opts['TableName'];

      function waitUntilTableActive(cb) {
        self.ddb.describeTable({TableName: tableName}, function(err, data) {
          DEBUG("ddb.describeTable", err, data);
          status = _.get(data, 'Table.TableStatus');
          if(status === 'ACTIVE') {
            created = true;
            cb();
          }
          else {
            waitUntilTableActive(cb);
          }
        });
      }

      function initializeTable(cb) {
        if(!created) {
          self.ddb.createTable(opts, function(err, data) {
            DEBUG("ddb.createTable", err, data);
            if(err && err.message.includes('Table already exists')) {
              created = true;
              status = 'ACTIVE';
              cb();
            }
            else {
              waitUntilTableActive(cb);
            }
          }); 
        }
        else {
          cb();
        }
      }

      return {
        save: function(doc, cb) {
          initializeTable(function() {
            self.doc.putItem({
              "TableName": tableName,
              "Item": doc
            }, function(err, data) {
              DEBUG("ddb.putItem", err, data);
              cb(err, data);
            });
          });
        }
      }
    },

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
            topicArn = data.TopicArn;
            if(cb) {
              cb(err, data.TopicArn);
            }
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
