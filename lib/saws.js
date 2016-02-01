var _ = require('lodash');

function DEBUG() {
  if(process.env.SAWS_DEBUG)
    console.log.apply(console, arguments);
}

module.exports = function(AWS) {
  var self = {
    stage: 'development',

    ddb: new AWS.DynamoDB(),
    doc: new AWS.DynamoDB.DocumentClient(),

    Table: function(opts) {
      var created;
      var status;

      var tableName = opts.TableName + '-' + self.stage;

      function waitUntilTableActive(cb) {
        self.ddb.describeTable({TableName: tableName}, function(err, data) {
          DEBUG('ddb.describeTable', err, data);
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
          self.ddb.createTable(_.merge(_.cloneDeep(opts), {TableName: tableName}), function(err, data) {
            DEBUG('ddb.createTable', err, data);
            if(err && ~err.message.indexOf('Table already exists')) {
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
        lookup: function(params, cb) {
          initializeTable(function() {
            self.doc.get({
              'TableName': tableName,
              'Key': params
            }, function(err, data) {
              DEBUG('ddb.doc.get', err, data);
              if(cb) {
                cb(err, data);
              }
            });
          });
        },

        save: function(params, cb) {
          initializeTable(function() {
            self.doc.put({
              'TableName': tableName,
              'Item': params
            }, function(err, data) {
              DEBUG('ddb.doc.put', err, data);
              if(cb) {
                cb(err, data.Item);
              }
            });
          });
        },

        scan: function(params, cb) {
          initializeTable(function() {
            self.doc.scan(_.merge(_.cloneDeep(params), {TableName: tableName}), function(err, data) {
              DEBUG('ddb.doc.scan', err, data);
              if(cb) {
                cb(err, data.Items);
              }
            });
          });
        }
      };
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
            DEBUG('sns.createTopic', err, data);
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
                DEBUG('sns.publish', err, data);
                cb(err, data);
              });
            }
          });
        }
      };
    },

    SNSEvent: function(sourceEvent) {
      return {
        eachMessage: function(cb) {
          return _.forEach(sourceEvent.Records, function(record) {
            cb(record.Sns, JSON.parse(record.Sns.Message));
          });
        }
      };
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
      };
    }
  };

  return self;
};
