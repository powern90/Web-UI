let Post = require('./public/javascript/post');
function Sender() {
    this.blue = [];
    this.red = true;
    this.list = [];
    this.post = new Post();
    this.isScroll = false;
    this.isSearch = 0;
}

module.exports = Sender;