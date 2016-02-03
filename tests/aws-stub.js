'use strict';
var sinon = require('sinon');

/**
 * A stubbed aws-sdk for use within tests. Any new services should be added here for use
 * within their tests.
 */
var AWSStub = function() {
  var AWS = {
    DynamoDB: sinon.stub(),
    SNS: sinon.stub(),
    SQS: sinon.stub()
  };
  AWS.DynamoDB.DocumentClient = sinon.stub();

  return AWS;
};

module.exports = AWSStub;
