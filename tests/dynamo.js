// jshint mocha: true
'use strict';
var _ = require('lodash');
var chai = require('chai');
var sinon = require("sinon");
chai.use(require("sinon-chai"));
chai.use(require("dirty-chai"));
var expect = chai.expect;
var AWSStub = require('./aws-stub');

// @param setCreated bool flag the table as having been already created on AWS. Defaults to true.
function FakeSaws(setCreated) {
    setCreated = (_.isNil(setCreated)) ? true : setCreated;

    var fake = {
      stage: 'test',
      DEBUG: sinon.stub(),
      AWS: new AWSStub()
    };
    require('../lib/services/dynamo')(fake);

    if (setCreated) {
      var createStub = sinon.stub();
      createStub.callsArgWith(1, {message: 'Table already exists', hey: 'hoh'});
      fake.AWS.DynamoDB.prototype.createTable = createStub;
      fake.Table.prototype.initialize = sinon.stub().callsArg(0);
    }

    return fake;
}

var tableDefinition = {
  TableName: "StripeCashier",
  KeySchema: [
    {AttributeName: 'IdentityId', KeyType: 'HASH'}
  ],
  AttributeDefinitions: [
    {AttributeName: 'IdentityId', AttributeType: 'S'}
  ],
  ProvisionedThroughput: { ReadCapacityUnits: 2, WriteCapacityUnits: 1 }
};

describe('DynamoDB functions', function() {
  it('new Saws.Table creates a new table if needed', function(done) {
    var fakeSaws = FakeSaws(false);

    var createStub = sinon.stub();
    createStub.callsArgWith(1, null, {TableStatus: 'CREATING'});
    fakeSaws.AWS.DynamoDB.prototype.createTable = createStub;

    var describeStub = sinon.stub();
    describeStub.onFirstCall().callsArgWith(1, null, {Table: { TableStatus: 'CREATING'}});
    describeStub.onSecondCall().callsArgWith(1, null, {Table: { TableStatus: 'CREATING'}});
    describeStub.onThirdCall().callsArgWith(1, null, {Table: { TableStatus: 'ACTIVE'}});
    fakeSaws.AWS.DynamoDB.prototype.describeTable = describeStub;

    var putStub = sinon.stub().callsArgWith(1, null, {});
    fakeSaws.AWS.DynamoDB.DocumentClient.prototype.put = putStub;

    var customers = new fakeSaws.Table(tableDefinition);
    customers.save({
      "IdentityId": "id0000001",
      "StripeCustomerId": "cus_00000001"
    }, function(err, data) {
      var expectedArgs = _.merge(_.cloneDeep(tableDefinition), {TableName: "StripeCashier-test"});
      expect(fakeSaws.AWS.DynamoDB.prototype.createTable).to.have.been.calledWith(expectedArgs);
      sinon.assert.calledThrice(fakeSaws.AWS.DynamoDB.prototype.describeTable);
      done();
    });
  });

  it('does do not break or call describeTable when table already exists', function(done) {
    var fakeSaws = FakeSaws(false);
    fakeSaws.AWS.DynamoDB.prototype.describeTable = sinon.stub();
    fakeSaws.AWS.DynamoDB.prototype.createTable = sinon.stub().callsArgWith(1, {message: 'Table already exists'});

    var putStub = sinon.stub().callsArgWith(1, null, {});
    fakeSaws.AWS.DynamoDB.DocumentClient.prototype.put = putStub;

    var customers = new fakeSaws.Table(tableDefinition);
    customers.save({
      "IdentityId": "id0000001",
      "StripeCustomerId": "cus_00000001"
    }, function(err, data) {
      sinon.assert.calledOnce(fakeSaws.AWS.DynamoDB.prototype.createTable);
      sinon.assert.notCalled(fakeSaws.AWS.DynamoDB.prototype.describeTable);
      sinon.assert.called(fakeSaws.AWS.DynamoDB.DocumentClient.prototype.put);
      expect(customers.created).to.be.true();
      done();
    });
  });

  it('does not break or call createTable when table already created', function(done) {
    var fakeSaws = FakeSaws(false);
    fakeSaws.AWS.DynamoDB.prototype.describeTable = sinon.stub();
    fakeSaws.AWS.DynamoDB.prototype.createTable = sinon.stub();

    var putStub = sinon.stub().callsArgWith(1, null, {});
    fakeSaws.AWS.DynamoDB.DocumentClient.prototype.put = putStub;

    var customers = new fakeSaws.Table(tableDefinition);
    customers.created = true;
    customers.save({
      "IdentityId": "id0000001",
      "StripeCustomerId": "cus_00000001"
    }, function(err, data) {
      sinon.assert.notCalled(fakeSaws.AWS.DynamoDB.prototype.createTable);
      sinon.assert.notCalled(fakeSaws.AWS.DynamoDB.prototype.describeTable);
      sinon.assert.called(fakeSaws.AWS.DynamoDB.DocumentClient.prototype.put);
      done();
    });
  });

  it('save() should persist an object', function(done) {
    var fakeSaws = FakeSaws();
    var putStub = sinon.stub().callsArgWith(1, null, {});
    fakeSaws.AWS.DynamoDB.DocumentClient.prototype.put = putStub;

    var customers = new fakeSaws.Table(tableDefinition);
    var params = {
      "IdentityId": "id0000001",
      "StripeCustomerId": "cus_00000001",
      "Name": "Rylo Ken",
      "Email": "emoryloken@empire.gov"
    };
    customers.save(params, function(err, data) {
      sinon.assert.calledOnce(fakeSaws.AWS.DynamoDB.DocumentClient.prototype.put);
      expect(fakeSaws.AWS.DynamoDB.DocumentClient.prototype.put).to.have.been.calledWith({TableName: "StripeCashier-test", Item: params});
      done();
    });
  });

  it('lookup() should retrieve a stored object', function(done) {
    var fakeSaws = FakeSaws();
    var getStub = sinon.stub().callsArgWith(1, null, {
      "Item": {
        "IdentityId": "id0000001",
        "Name": "Rylo Ken"
      }
    });
    fakeSaws.AWS.DynamoDB.DocumentClient.prototype.get = getStub;

    var customers = new fakeSaws.Table(tableDefinition);
    var params = {
      "IdentityId": "id0000001"
    };
    customers.lookup(params, function(err, data) {
      sinon.assert.calledOnce(fakeSaws.AWS.DynamoDB.DocumentClient.prototype.get);
      expect(fakeSaws.AWS.DynamoDB.DocumentClient.prototype.get).to.have.been.calledWith({Key: params, TableName: "StripeCashier-test"});
      expect(err).to.not.exist();
      expect(data).to.be.instanceof(Object);
      expect(data.Name).to.equal('Rylo Ken');
      done();
    });
  });

  it('lookup() should work when no objects are found', function(done) {
    var fakeSaws = FakeSaws();
    var getStub = sinon.stub().callsArgWith(1, null, null);
    fakeSaws.AWS.DynamoDB.DocumentClient.prototype.get = getStub;

    var customers = new fakeSaws.Table(tableDefinition);
    var params = {
      "IdentityId": "id0000001"
    };
    customers.lookup(params, function(err, data) {
      sinon.assert.calledOnce(fakeSaws.AWS.DynamoDB.DocumentClient.prototype.get);
      expect(fakeSaws.AWS.DynamoDB.DocumentClient.prototype.get).to.have.been.calledWith({Key: params, TableName: "StripeCashier-test"});
      expect(err).to.not.exist();
      expect(data).to.not.exist();
      done();
    });
  });

  it('should retrieve multiple stored objects with scan()', function(done) {
    var fakeSaws = FakeSaws();
    var scanStub = sinon.stub().callsArgWith(1, null, {});
    scanStub.callsArgWith(1, null, {Items: [{name: '1'}, {name: '2'}], NextMarker: 'The next'});
    fakeSaws.AWS.DynamoDB.DocumentClient.prototype.scan = scanStub;

    var customers = new fakeSaws.Table(tableDefinition);
    var params = {
      "IdentityId": "id0000001"
    };
    customers.scan(params, function(err, items) {
      sinon.assert.called(fakeSaws.AWS.DynamoDB.DocumentClient.prototype.scan);
      expect(fakeSaws.AWS.DynamoDB.DocumentClient.prototype.scan).to.have.been.calledWith({IdentityId: "id0000001", TableName: "StripeCashier-test"});
      expect(err).to.not.exist();
      expect(items).to.be.instanceof(Array);
      expect(items).to.have.length(2);
      expect(items[0].name).to.be.equal('1');
      done();
    });
  });

  it('should delete an item with simple params', function(done) {
    var fakeSaws = FakeSaws();
    var deleteStub = sinon.stub().callsArgWith(1, null, {});
    deleteStub.callsArgWith(1, null, null);
    fakeSaws.AWS.DynamoDB.DocumentClient.prototype.delete = deleteStub;

    var customers = new fakeSaws.Table(tableDefinition);
    var params = {
      "IdentityId": "id0000001"
    };
    customers.delete(params, function(err, data) {
      sinon.assert.called(fakeSaws.AWS.DynamoDB.DocumentClient.prototype.delete);
      expect(fakeSaws.AWS.DynamoDB.DocumentClient.prototype.delete).to.have.been.calledWith({Key: {IdentityId: "id0000001"}, TableName: "StripeCashier-test"});
      expect(err).to.not.exist();
      expect(data).to.not.exist();
      done();
    });
  });

  it('should delete an item with advanced params', function(done) {
    var fakeSaws = FakeSaws();
    var deleteStub = sinon.stub().callsArgWith(1, null, {});
    deleteStub.callsArgWith(1, null, null);
    fakeSaws.AWS.DynamoDB.DocumentClient.prototype.delete = deleteStub;

    var customers = new fakeSaws.Table(tableDefinition);
    var params = {
      Key: {
        IdentityId: "id0000001"
      },
      ReturnValues: 'ALL_OLD'
    };
    customers.delete(params, function(err, data) {
      sinon.assert.called(fakeSaws.AWS.DynamoDB.DocumentClient.prototype.delete);
      expect(fakeSaws.AWS.DynamoDB.DocumentClient.prototype.delete).to.have.been.calledWith({
        TableName: "StripeCashier-test",
        Key: {IdentityId: "id0000001"},
        ReturnValues: 'ALL_OLD'
      });
      expect(err).to.not.exist();
      expect(data).to.not.exist();
      done();
    });
  });

  it('should not accept extraneous properties to delete()', function(done) {
    var fakeSaws = FakeSaws();
    fakeSaws.AWS.DynamoDB.DocumentClient.prototype.delete = sinon.stub();

    var customers = new fakeSaws.Table(tableDefinition);
    var params = {
      "IdentityId": "id0000001",
      "TooMany": "properties"
    };
    customers.delete(params, function(err, data) {
      expect(fakeSaws.AWS.DynamoDB.DocumentClient.prototype.delete).to.not.have.been.called();
      expect(err).to.exist();
      done();
    });
  });

  it('should retrieve stored objects with query()', function(done) {
    var fakeSaws = FakeSaws();
    var queryStub = sinon.stub().callsArgWith(1, null, {});
    queryStub.callsArgWith(1, null, {Items: [{name: '1'}, {name: '2'}], NextMarker: 'The next'});
    fakeSaws.AWS.DynamoDB.DocumentClient.prototype.query = queryStub;

    var customers = new fakeSaws.Table(tableDefinition);
    var params = {
      KeyConditionExpression: "IdentityId = :hkey",
      ExpressionAttributeValues: { ":hkey" : "id0000001" }
    };
    customers.query(params, function(err, items) {
      sinon.assert.called(fakeSaws.AWS.DynamoDB.DocumentClient.prototype.query);
      expect(fakeSaws.AWS.DynamoDB.DocumentClient.prototype.query).to.have.been.calledWith({KeyConditionExpression: "IdentityId = :hkey",
                                                                                            ExpressionAttributeValues: { ":hkey" : "id0000001" },
                                                                                            TableName: "StripeCashier-test"});
      expect(err).to.not.exist();
      expect(items).to.be.instanceof(Array);
      expect(items).to.have.length(2);
      expect(items[0].name).to.be.equal('1');
      done();
    });
  });

  it('should work when no objects are found with query()', function(done) {
    var fakeSaws = FakeSaws();
    var queryStub = sinon.stub().callsArgWith(1, null, {});
    queryStub.callsArgWith(1, null, null);
    fakeSaws.AWS.DynamoDB.DocumentClient.prototype.query = queryStub;

    var customers = new fakeSaws.Table(tableDefinition);
    var params = {
      KeyConditionExpression: "IdentityId = :hkey",
      ExpressionAttributeValues: { ":hkey" : "id0000002" }
    };
    customers.query(params, function(err, items) {
      sinon.assert.called(fakeSaws.AWS.DynamoDB.DocumentClient.prototype.query);
      expect(fakeSaws.AWS.DynamoDB.DocumentClient.prototype.query).to.have.been.calledWith({KeyConditionExpression: "IdentityId = :hkey",
                                                                                            ExpressionAttributeValues: { ":hkey" : "id0000002" },
                                                                                            TableName: "StripeCashier-test"});
      expect(err).to.not.exist();
      expect(items).to.not.exist();
      done();
    });
  });
});
