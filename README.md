![Chainsaws](https://dl.dropboxusercontent.com/u/1770482/Chainsaws.png)

## Purpose

Provides abstraction layer for core AWS application services such as SNS and SQS so that your microservices don't end up tightly coupled to the platform. Helps immensely with testability and other concerns related to maintaining a so-called hexagonal architecture. <http://alistair.cockburn.us/Hexagonal+architecture>

Perfect for Serverless architecture style. Learn more at http://leanpub.com/serverless

## Installing

```sh
npm install chainsaws
```

## Usage

Initialize with the `AWS` sdk instance.

```javascript
var AWS = require('aws-sdk');
var Chainsaws = new require('chainsaws')(AWS);
```

Instantiate chainsaws for topics and queues as needed. Payload is automatically run through `JSON.stringify()`.

```javascript
var topic = new Chainsaws.Topic(topicArn);
topic.publish({foo: "bar"}, done);
```

```javascript
var queue = new Chainsaws.Queue(url);
queue.publish({foo: "bar"}, done);
```