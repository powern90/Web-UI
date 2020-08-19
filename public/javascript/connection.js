var socket = io();
var load = 25;
var click = 0;
socket.on('send', function (data) {
    //data가 sender객체
    //하나씩 값 확인해서 해당부분 처리하면 됨
    if (data.list.length !== 0) {
        load = load + 25;
        for (var i = 0; i < 25; i++) {
            $('#deleteable').append("<div class=".concat('"card" onclick="post_onClick(', data.list[i].idx, ')">\n', '<div class="container-fluid">\n' +
                '                            <div class="card-body">\n' +
                '                                <p class="card-columns" id="idx">', data.list[i].idx, '</p>\n', '<h5 class="card-title" id="title">', data.list[i].title, '</h5>\n',
                '<p class="card-text" id="date">', data.list[i].ctime, '<p class="card-text" id="blue">블루</p>\n' + '<p class="card-text" id="from">',
                data.list[i].url, '</p>', '</div>\n' +
                '                        </div>\n' +
                '                    </div>'));
        }
    }
    if (data.post.idx !== 0) {
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
    var data = new Data();
    click = idx;
    data.insertScroll();
    data.insertClick(idx);
    data.insertDelete();
    data.insertSave();
    data.insertSearch();
    send(data);
}

function getTimeStamp() {
    var d = new Date();
    return leadingZeros(d.getFullYear(), 4) + '-' +
        leadingZeros(d.getMonth() + 1, 2) + '-' +
        leadingZeros(d.getDate(), 2);
}

function leadingZeros(n, digits) {
    var zero = '';
    n = n.toString();
    if (n.length < digits) {
        for (i = 0; i < digits - n.length; i++) zero += '0';
    }
    return zero + n;
}

function search_date() {
    var data = new Data();
    var startDate = $('#startDate').val();
    var endDate = $('#endDate').val();
    var date_pattern = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/;
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
    var post = new Post();
    var data = new Data();
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
        var data = new Data();
        data.insertScroll(load);
        data.insertClick();
        data.insertDelete();
        data.insertSave();
        data.insertSearch();
        send(data);
    }
});