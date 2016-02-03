// jshint mocha: true
'use strict';
var util = require('util');

var _ = require('lodash');
var chai = require('chai');
var sinon = require("sinon");
chai.use(require("sinon-chai"));
var expect = chai.expect;

describe('Saws', function() {
  it('should autoload submodules', function(done) {
    // Unfortunately we'll need some stubs for the submodules to call
    var AWSStub = {
        DynamoDB: sinon.stub,
        SNS: sinon.stub,
        SQS: sinon.stub
    };
    AWSStub.DynamoDB.DocumentClient = sinon.stub();

    var Saws = require('../lib/saws');
    var saws = new Saws(AWSStub);
    // Spot check a couple of the services
    var expectedModules = [
      'Queue',
      'Topic',
      'Table',
      'SNSEvent',
    ];

    expectedModules.forEach(function(moduleName) {
        expect(saws[moduleName]).to.be.instanceof(Function, util.format('saws.%s not found', moduleName));
    });
    done();
  });
});
