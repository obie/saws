'use strict';
var sinon = require('sinon');

// Grabbed from https://github.com/aws/aws-sdk-js
var services = [
  'CloudFront',
  'CloudSearch',
  'CloudSearchDomain',
  'CloudWatch',
  'CloudWatchLogs',
  'CognitoIdentity',
  'CognitoSync',
  'DynamoDB',
  'DynamoDB.DocumentClient',
  'ECS',
  'EC2',
  'EMR',
  'ElasticTranscoder',
  'ElastiCache',
  'Glacier',
  'Kinesis',
  'Redshift',
  'RDS',
  'Route53',
  'Route53Domains',
  'SES',
  'SNS',
  'SQS',
  'S3 ',
  'SWF',
  'SimpleDB',
  'AutoScaling',
  'CloudFormation',
  'CloudTrail',
  'CodeDeploy',
  'ConfigService',
  'DataPipeline',
  'DirectConnect',
  'ElasticBeanstalk',
  'IAM',
  'ImportExport',
  'KMS',
  'Lambda',
  'OpsWorks',
  'STS',
  'StorageGateway',
  'Support',
  'ELB'
];

function addFunctionToObj(obj, name) {
  var names = name.split('.');
  var namespace = names[0];

  obj[namespace] = function() {} || obj[namespace];

  if (names.length > 1) {
    addFunctionToObj(obj[namespace], names.slice(1).join('.'));
  }
}

var AWSStub = function() {
  var AWS = {};

  services.forEach(function(serviceName) {
    addFunctionToObj(AWS, serviceName);
  });

  return AWS;
};

module.exports = AWSStub;
