let Post = require('./post');
function Sender() {
    this.blue = [];
    this.red = true;
    this.list = [];
    this.post = new Post();
}

module.exports = Sender;