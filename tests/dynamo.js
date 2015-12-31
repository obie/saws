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
    {AttributeName: 'IdentityId', KeyType: 'HASH'},
    {AttributeName: 'StripeCustomerId', KeyType: 'RANGE'}
  ],
  AttributeDefinitions: [
    {AttributeName: 'IdentityId', AttributeType: 'S'},
    {AttributeName: 'StripeCustomerId', AttributeType: 'S'}
  ],
  ProvisionedThroughput: { ReadCapacityUnits: 2, WriteCapacityUnits: 1 }
};

describe('DynamoDB functions', function() {
  var createTableStub = sinon.stub(Saws.ddb, 'createTable');
  var describeTableStub = sinon.stub(Saws.ddb, 'describeTable');
  var putItemStub = sinon.stub(Saws.doc, 'put');

  describe('new Table', function() {

    it('creates a new table if needed', function(done) {
      createTableStub.callsArgWith(1, null, {TableStatus: 'CREATING'});
      describeTableStub.onFirstCall().callsArgWith(1, null, {Table: { TableStatus: 'CREATING'}});
      describeTableStub.onSecondCall().callsArgWith(1, null, {Table: { TableStatus: 'CREATING'}});
      describeTableStub.onThirdCall().callsArgWith(1, null, {Table: { TableStatus: 'ACTIVE'}});
      putItemStub.callsArgWith(1, null, {});

      var customers = new Saws.Table(tableDefinition);
      customers.save({
        "IdentityId": "id0000001",
        "StripeCustomerId": "cus_00000001"
      }, done);
      expect(createTableStub).to.have.been.calledWith(tableDefinition);
    });


    it('does not break when table already exists', function(done) {
      createTableStub.callsArgWith(1, {message: 'Table already exists'});
      putItemStub.callsArgWith(1, null, {});

      var customers = new Saws.Table(tableDefinition);
      customers.save({
        "IdentityId": "id0000001",
        "StripeCustomerId": "cus_00000001"
      }, done);
      expect(createTableStub).to.have.been.calledWith(tableDefinition);
    });
  });

  describe('save', function() {
    it('should save an object', function(done) {
      createTableStub.callsArgWith(1, {message: 'Table already exists'});
      putItemStub.callsArgWith(1, null, {});

      var customers = new Saws.Table(tableDefinition);
      customers.save({
        "IdentityId": "id0000001",
        "StripeCustomerId": "cus_00000001",
        "Name": "Rylo Ken",
        "Email": "emoryloken@empire.gov"
      }, done);
    });
  });
});