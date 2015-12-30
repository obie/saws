![Chainsaws](https://dl.dropboxusercontent.com/u/1770482/Chainsaws.png)

## Purpose

Provides abstraction layer for core AWS application services such as SNS and SQS so that your microservices don't end up tightly coupled to the platform. Helps immensely with testability and other concerns related to maintaining a so-called hexagonal architecture. <http://alistair.cockburn.us/Hexagonal+architecture>

Perfect for Serverless architecture style. Learn more at <http://leanpub.com/serverless>

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

### Stage Variable

Set a value for the stage variable to indicate which environment you're running in. This is useful in conjunction with frameworks such as <http://serverless.com>

```javascript
// defaults to 'development'
Chainsaws.stage = process.env.SERVERLESS_STAGE;
```

Instantiate chainsaws for topics and queues as needed.

### SNS (Simple Notification Service)

Start by instantiating a topic object.

```javascript
var topic = new Chainsaws.Topic("NewOrders");
```

#### Automatic Topic Creation

Creating a `Topic` will automatically create an SNS Topic on AWS if it does not already exist. The value of `Chainsaw.stage` is appended to the topic name.

#### Sending messages

Send a message using `publish`. First argument is the payload, second is a callback to be invoked when publishing is done.

```javascript
topic.publish("a new order has arrived", function(err, data) { ... });
```

The callback is invoked when a response from the service is returned.  The context of the callback (`this`) is set to the response object containing error, data properties, and the original request object.

**`data`** is an object with the de-serialized data returned from the request with a ` MessageId` property corresponding to the unique identifier string identifier assigned by SNS to the published message.

#### Expects to be using JSON as payload format

Payload is automatically run through `JSON.stringify()`.

```javascript
var topic = new Chainsaws.Topic(topicArn);
topic.publish({foo: "bar"}, done);
```

### SQS (Simple Queue Service)

```javascript
var queue = new Chainsaws.Queue(url);
queue.publish({foo: "bar"}, done);

## Debug

Set `CHAINSAWS_DEBUG` to true in your environment to enable debug output to the console.
```