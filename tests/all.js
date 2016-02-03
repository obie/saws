// jshint mocha: true
'use strict';

describe('All Tests', function() {
  require('./saws');
  require('./dynamo');
  require('./sns');
  require('./sqs');
});
