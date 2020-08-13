var Post = require('./post');
function Sender() {
    this.blue = [];
    this.red = 0;           //0: 안쓰는거  1: 끄는거  2: 키는거
    this.list = [];
    this.post = new Post();
}

module.exports = Sender;