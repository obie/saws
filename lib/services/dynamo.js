'use strict';
var _ = require('lodash');

module.exports = function(Saws) {
  var ddb = new Saws.AWS.DynamoDB();
  var doc = new Saws.AWS.DynamoDB.DocumentClient();

  var Table = function(opts) {
    this.tableName = opts.TableName + '-' + Saws.stage;
    this.opts = opts;
    this.created = false;
  };

  Table.prototype.waitUntilTableActive = function(cb) {
    var self = this;

    ddb.describeTable({TableName: this.tableName}, function(err, data) {
      Saws.DEBUG('ddb.describeTable', err, data);
      self.status = _.get(data, 'Table.TableStatus');
      if(self.status === 'ACTIVE') {
        self.created = true;
        cb();
      }
      else {
        self.waitUntilTableActive(cb);
      }
    });
  };

  Table.prototype.initialize = function(cb) {
    if(!this.created) {
      var self = this;

      ddb.createTable(_.merge(_.cloneDeep(this.opts), {TableName: this.tableName}),
        function(err, data) {
          Saws.DEBUG('ddb.createTable', err, data);
          if(err && ~err.message.indexOf('Table already exists')) {
            self.created = true;
            self.status = 'ACTIVE';
            cb();
          }
          else {
            self.waitUntilTableActive(cb);
          }
        }
      );
    }
    else {
      cb();
    }
  };

  Table.prototype.lookup = function(params, cb) {
    var self = this;

    this.initialize(function() {
      doc.get({
        'TableName': self.tableName,
        'Key': params
      }, function(err, data) {
        Saws.DEBUG('ddb.doc.get', err, data);
        if(cb) {
          cb(err, data);
        }
      });
    });
  };

  Table.prototype.save = function(params, cb) {
    var self = this;

    this.initialize(function() {
      doc.put({
        'TableName': self.tableName,
        'Item': params
      }, function(err, data) {
        Saws.DEBUG('ddb.doc.put', err, data);
        if (data) {
          data = data.Item;
        }

        if(cb) {
          cb(err, data);
        }
      });
    });
  };

  Table.prototype.scan = function(params, cb) {
    var self = this;

    this.initialize(function() {
      doc.scan(_.merge(_.cloneDeep(params), {TableName: self.tableName}), function(err, data) {
        Saws.DEBUG('ddb.doc.scan', err, data);
        if(cb) {
          cb(err, data.Items);
        }
      });
    });
  };

  Saws.Table = Table;
};
