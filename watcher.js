function Watchlist() {
    this.user_list = {};
}

Watchlist.prototype.add_user = function (id) {
    if (Object.keys(this.user_list).includes(id) === false) {
        this.user_list[id] = 0;
    }
}

Watchlist.prototype.editing = function (id, idx) {
    if (Object.values(this.user_list).includes(idx)) {
        if (this.user_list[id] === idx) return false;
        this.user_list[id] = 0;
        return true;
    } else {
        if (idx !== null) this.user_list[id] = idx;
        return false;
    }
}

Watchlist.prototype.disconnect = function (id) {
    delete this.user_list[id];
}

module.exports = Watchlist;