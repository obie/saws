# Saws

Simple AWS abstraction library for Node.

## Purpose

Provides a flexible and testable abstraction layer for core AWS application services such as SNS and SQS so that your code doesn't end up tightly coupled to the platform. Helps immensely with testability and other concerns related to maintaining a so-called hexagonal architecture. <http://alistair.cockburn.us/Hexagonal+architecture>

Perfect for Serverless architecture style. Learn more at <http://leanpub.com/serverless>

## Installing

```sh
npm install saws
```

## Usage

Initialize with the `AWS` sdk instance.

```javascript
var AWS = require('aws-sdk');
var Saws = new require('saws')(AWS);
```

### Stage Variable

Set a value for the stage variable to indicate which environment you're running in. This is useful in conjunction with frameworks such as <http://serverless.com>

```javascript
// defaults to 'development'
Saws.stage = process.env.SERVERLESS_STAGE;
```

Instantiate saws for topics and queues as needed.

### SNS (Simple Notification Service)

Start by instantiating a topic object.

```javascript
var topic = new Saws.Topic("NewOrders");
```

#### Automatic Topic Creation

Creating a `Topic` will automatically create an SNS Topic on AWS if it does not already exist. The value of `Saw.stage` is appended to the topic name.

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
var topic = new Saws.Topic("NewOrders");
topic.publish({
  NewOrder: {
      userId: user.userId,
      deliveryAddress: user.deliveryAddress,
      stripeSource: user.stripeSource,
      preferences: user.preferences
    }
}, done);
```

### SQS (Simple Queue Service)

_coming soon_

```javascript
var queue = new Saws.Queue(url);
queue.publish({foo: "bar"}, done);
```

## Debug

Set `CHAINSAWS_DEBUG` to true in your environment to enable debug output to the console.