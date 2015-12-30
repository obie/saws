
module.exports = function(AWS) {
  return {
    create: function() {
      return new AWS.SNS();
    }
    publish: function() {
      return create().publish();
    }
  }
}
