function Srv() {
    this.scroll_idx = null;
    this.search_parm = {
        i: null,
        k: [],
        d: [],
        isSearch: false
    }
    this.post = null
    this.isEditing = false;
}

Srv.prototype.build = function(scroll_idx=null, i=null, k=[], d=[],
                               isSearch=false, post=null, isEditing=false) {
    this.scroll_idx = scroll_idx;
    this.search_parm.i = i;
    this.search_parm.k = k;
    this.search_parm.d = d;
    this.search_parm.isSearch = isSearch;
    this.post = post;
    this.isEditing = isEditing;
}

module.exports = Srv;