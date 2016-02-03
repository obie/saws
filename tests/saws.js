// jshint mocha: true
'use strict';
var util = require('util');

var _ = require('lodash');
var chai = require('chai');
var sinon = require("sinon");
chai.use(require("sinon-chai"));
var expect = chai.expect;
var AWSStub = require('./aws-stub');

describe('Saws', function() {
  it('should autoload submodules', function(done) {
    var Saws = require('../lib/saws').Saws;
    var saws = new Saws(require('./aws-stub')());

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
