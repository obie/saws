// jshint mocha: true
'use strict';
var util = require('util');

var _ = require('lodash');
var chai = require('chai');
var sinon = require("sinon");
var expect = chai.expect;

var AWSStub = require('./aws-stub');

chai.use(require("sinon-chai"));
chai.use(require("dirty-chai"));

describe('Saws', function() {
  var saws;

  beforeEach(function() {
    var Saws = require('../lib/saws').Saws;
    saws = new Saws(require('./aws-stub')());
  });

  it('should autoload submodules', function(done) {
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

  it('should only log in debug mode', function(done) {
    var original = process.env.SAWS_DEBUG;
    delete process.env.SAWS_DEBUG;

    sinon.spy(console, 'log');
    saws.DEBUG('');

    expect(console.log).to.not.have.been.called();

    process.env.SAWS_DEBUG = true;
    saws.DEBUG('');
    expect(console.log).to.have.been.called();

    console.log.restore();

    if (original) {
      process.env.SAWS_DEBUG = original;
    } else {
      delete process.env.SAWS_DEBUG;
    }

    done();
  });
});
