// jshint mocha: true
var _ = require('lodash');
var chai = require('chai');
var sinon = require("sinon");
chai.use(require("sinon-chai"));
var expect = chai.expect;

var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});

var Saws = new require('../lib/saws.js')(AWS);

Saws.stage = "test";

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
  // Give each stub a name with arguments to be passed to sinon.stub
  var STUB_DEFINITIONS = {
      createTable: [Saws.ddb, 'createTable'],
      describeTable: [Saws.ddb, 'describeTable'],
      put: [Saws.doc, 'put'],
      get: [Saws.doc, 'get'],
      scan: [Saws.doc, 'scan']
  };

  // Each STUB_DEFINITION will have a corresponfing stub created in `stubs`
  var stubs = {};

  beforeEach(function() {
    var stubNames = Object.getOwnPropertyNames(STUB_DEFINITIONS);

    for(var i = 0; i < stubNames.length; i++) {
        stubs[stubNames[i]] = sinon.stub.apply(sinon, STUB_DEFINITIONS[stubNames[i]]);
    }
  });

  afterEach(function() {
    _.each(Object.getOwnPropertyNames(stubs), function(stubName) {
      stubs[stubName].restore();
    });
  });

  it('new Saws.Table creates a new table if needed', function(done) {
    stubs.createTable.callsArgWith(1, null, {TableStatus: 'CREATING'});
    stubs.describeTable.onFirstCall().callsArgWith(1, null, {Table: { TableStatus: 'CREATING'}});
    stubs.describeTable.onSecondCall().callsArgWith(1, null, {Table: { TableStatus: 'CREATING'}});
    stubs.describeTable.onThirdCall().callsArgWith(1, null, {Table: { TableStatus: 'ACTIVE'}});
    stubs.put.callsArgWith(1, null, {});

    var customers = new Saws.Table(tableDefinition);
    customers.save({
      "IdentityId": "id0000001",
      "StripeCustomerId": "cus_00000001"
    }, done);

    expect(stubs.createTable).to.have.been.calledWith(_.merge(_.cloneDeep(tableDefinition), {TableName: "StripeCashier-test"}));
  });

  it('operations do not break or call describeTable when table already exists', function(done) {
    stubs.createTable.callsArgWith(1, {message: 'Table already exists'});
    stubs.put.callsArgWith(1, null, {});

    var customers = new Saws.Table(tableDefinition);
    customers.save({
      "IdentityId": "id0000001",
      "StripeCustomerId": "cus_00000001"
    }, done);

    sinon.assert.notCalled(stubs.describeTable);
    sinon.assert.called(stubs.put);
  });

  it('save() should persist an object', function(done) {
    stubs.createTable.callsArgWith(1, {message: 'Table already exists'});
    stubs.put.callsArgWith(1, null, {});

    var customers = new Saws.Table(tableDefinition);
    var params = {
      "IdentityId": "id0000001",
      "StripeCustomerId": "cus_00000001",
      "Name": "Rylo Ken",
      "Email": "emoryloken@empire.gov"
    };
    customers.save(params, done);

    sinon.assert.called(stubs.put);
    expect(stubs.put).to.have.been.calledWith({TableName: "StripeCashier-test", Item: params});
  });

  it('lookup() should retrieve a stored object', function(done) {
    stubs.createTable.callsArgWith(1, {message: 'Table already exists'});
    stubs.get.callsArgWith(1, null, {});

    var customers = new Saws.Table(tableDefinition);
    var params = {
      "IdentityId": "id0000001"
    };
    customers.lookup(params, done);

    sinon.assert.called(stubs.get);
    expect(stubs.get).to.have.been.calledWith({Key: params, TableName: "StripeCashier-test"});
  });

  it('scan() should retrieve multiple stored objects', function(done) {
    stubs.createTable.callsArgWith(1, {message: 'Table already exists'});
    stubs.scan.callsArgWith(1, null, {Items: {}});

    var customers = new Saws.Table(tableDefinition);
    var params = {
      "IdentityId": "id0000001"
    };
    customers.scan(params, done);

    sinon.assert.called(stubs.scan);
    expect(stubs.scan).to.have.been.calledWith({IdentityId: "id0000001", TableName: "StripeCashier-test"});
  });
});
