const socket = io();
let load = 25;
let click = 0;

socket.on('send', function (data) {
    let i;
    if (data.isScroll === true) {
        load = load + 25;
        for (i = 0; i < 25; i++) {
            $('#deleteable').append("<div class=".concat('"card" onclick="post_onClick(', data.list[i].idx, ')">\n',
                '<div class="container-fluid">\n' +
                '<div class="card-body">\n' +
                '<p class="card-columns" id="idx">', data.list[i].idx, '</p>\n',
                '<h5 class="card-title" id="title">', data.list[i].title, '</h5>\n',
                '<p class="card-text" id="date">', data.list[i].ctime,
                '<p class="card-text" id="blue">블루</p>\n' + '<p class="card-text" id="from">',
                data.list[i].url, '</p>', '</div>\n' +
                '</div>\n' +
                '</div>'));
        }
    }
    if (data.isSearch !== 0) {
        load = load + 25;
        $('#deleteable').empty();
        for (i = 0; i < data.list.length; i++) {
            $('#deleteable').append("<div class=".concat('"card" onclick="post_onClick(', data.list[i].idx, ')">\n',
                '<div class="container-fluid">\n' +
                ' <div class="card-body">\n' +
                '<p class="card-columns" id="idx">', data.list[i].idx, '</p>\n',
                '<h5 class="card-title" id="title">', data.list[i].title, '</h5>\n',
                '<p class="card-text" id="date">', data.list[i].ctime,
                '<p class="card-text" id="blue">블루</p>\n' + '<p class="card-text" id="from">',
                data.list[i].url, '</p>', '</div>\n' +
                '</div>\n' +
                '</div>'));
        }
    }
    if (data.post.idx !== null) {
        $('#form-title').val(data.post.title);
    }
    if (data.red) {
        console.log(data.red);
        $('#circle1').show();
    } else {
        $('#circle1').hide();
    }
});

function post_onClick(idx) {
    const data = new Data();
    click = idx;
    data.insertScroll();
    data.insertClick(idx);
    data.insertDelete();
    data.insertSave();
    data.insertSearch();
    send(data);
}

function getTimeStamp() {
    const d = new Date();
    return leadingZeros(d.getFullYear(), 4) + '-' +
        leadingZeros(d.getMonth() + 1, 2) + '-' +
        leadingZeros(d.getDate(), 2);
}

function leadingZeros(n, digits) {
    let zero = '';
    n = n.toString();
    if (n.length < digits) {
        for (let i = 0; i < digits - n.length; i++) zero += '0';
    }
    return zero + n;
}

function search_date() {
    const data = new Data();
    const startDate = $('#startDate').val();
    let endDate = $('#endDate').val();
    const date_pattern = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/;
    if (!date_pattern.test(startDate)) {
        alert("StartDate Error");
    }
    if (endDate.length === 0) endDate = getTimeStamp();
    if (!date_pattern.test(endDate)) {
        alert("EndDate Error");
    }
    socket.emit('search', {startDate: startDate, endDate: endDate});
}

function send(data) {
    socket.emit('req', data);
}

function submit_update() {
    const post = new Post();
    const data = new Data();
    post.title = $('#form-title').val();
    post.idx = click;
    post.area = $('#form-area').val();
    post.date = $('#form-date').val();
    post.support = $('#form-support').val();
    post.target = $('#form-target').val();
    data.insertScroll();
    data.insertClick();
    data.insertDelete();
    data.insertSave(post);
    data.insertSearch();
    send(data);
}


$("#dv1").scroll(function () {
    const elem = $("#dv1");
    if (elem[0].scrollHeight - elem.scrollTop() === elem.outerHeight()) {
        const data = new Data();
        data.insertScroll(load);
        data.insertClick();
        data.insertDelete();
        data.insertSave();
        data.insertSearch();
        send(data);
    }
});

function search_idx() {
    const value = $('#sidx').val();
    load = parseInt(value);
    const data = new Data();
    data.insertScroll();
    data.insertClick();
    data.insertDelete();
    data.insertSave();
    data.insertSearch(1, load, null, null, null);
    send(data);
}

function search_keyword() {
    const value = $('#kidx').val();
    const data = new Data();
    data.insertScroll();
    data.insertClick();
    data.insertDelete();
    data.insertSave();
    data.insertSearch(3, null, null, null, value);
    send(data);
}