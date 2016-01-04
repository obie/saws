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
  var createTableStub;
  var describeTableStub;
  var putStub;
  var getStub;

  beforeEach(function() {
    createTableStub = sinon.stub(Saws.ddb, 'createTable');
    describeTableStub = sinon.stub(Saws.ddb, 'describeTable');
    putStub = sinon.stub(Saws.doc, 'put');
    getStub = sinon.stub(Saws.doc, 'get');
  });

  afterEach(function() {
    _.each([createTableStub, describeTableStub, putStub, getStub], function(spy) {
      spy.restore();
    });
  });

  it('new Saws.Table creates a new table if needed', function(done) {
    createTableStub.callsArgWith(1, null, {TableStatus: 'CREATING'});
    describeTableStub.onFirstCall().callsArgWith(1, null, {Table: { TableStatus: 'CREATING'}});
    describeTableStub.onSecondCall().callsArgWith(1, null, {Table: { TableStatus: 'CREATING'}});
    describeTableStub.onThirdCall().callsArgWith(1, null, {Table: { TableStatus: 'ACTIVE'}});
    putStub.callsArgWith(1, null, {});

    var customers = new Saws.Table(tableDefinition);
    customers.save({
      "IdentityId": "id0000001",
      "StripeCustomerId": "cus_00000001"
    }, done);

    expect(createTableStub).to.have.been.calledWith(_.merge(_.cloneDeep(tableDefinition), {TableName: "StripeCashier-test"}));
  });

  it('operations do not break or call describeTable when table already exists', function(done) {
    createTableStub.callsArgWith(1, {message: 'Table already exists'});
    putStub.callsArgWith(1, null, {});

    var customers = new Saws.Table(tableDefinition);
    customers.save({
      "IdentityId": "id0000001",
      "StripeCustomerId": "cus_00000001"
    }, done);
    
    sinon.assert.notCalled(describeTableStub);
    sinon.assert.called(putStub);
  });

  it('save() should persist an object', function(done) {
    createTableStub.callsArgWith(1, {message: 'Table already exists'});
    putStub.callsArgWith(1, null, {});

    var customers = new Saws.Table(tableDefinition);
    var params = {
      "IdentityId": "id0000001",
      "StripeCustomerId": "cus_00000001",
      "Name": "Rylo Ken",
      "Email": "emoryloken@empire.gov"
    }
    customers.save(params, done);

    sinon.assert.called(putStub);
    expect(putStub).to.have.been.calledWith({TableName: "StripeCashier-test", Item: params});
  });

  it('lookup() should retrieve a stored object', function(done) {
    createTableStub.callsArgWith(1, {message: 'Table already exists'});
    getStub.callsArgWith(1, null, {});

    var customers = new Saws.Table(tableDefinition);
    var params = {
      "IdentityId": "id0000001"
    }
    customers.lookup(params, done);
    
    sinon.assert.called(getStub);
    expect(getStub).to.have.been.calledWith({Key: params, TableName: "StripeCashier-test"});
  });
});