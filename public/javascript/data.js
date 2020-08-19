function Data() {
    this.search = {};
    this.scroll = {};
    this.save = {};
    this.delete = {};
    this.click = {};
}

Data.prototype.insertSearch = function(condition=0, idx=null, startDate= null, endDate=null, keyword=null) {
    this.search = {
        condition: condition,            //0: 안쓰는거   1: idx   2: date   3: keyword
        idx: idx,
        startDate: startDate,
        endDate: endDate,
        keyword: keyword
    }
}

Data.prototype.insertScroll = function(curidx=null) {
    this.scroll = {
        curidx: curidx
    }
}

Data.prototype.insertSave = function(update=new Post()) {
    this.save = {
        update: update,
    }
}

Data.prototype.insertDelete = function(idx=null) {
    this.delete = {
        idx: idx
    }
}

Data.prototype.insertClick = function(idx=null) {
    this.click = {
        idx: idx
    }
}