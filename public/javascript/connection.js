const socket = io();

socket.on('send', function (data) {
    let i;
    let deletable = $('#deleteable');
    for (i = 0; i < 25; i++) {
        deletable.append("<div class=".concat('"card" onclick="post_onClick(', data.list[i].idx, ')">\n',
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
});

function post_onClick(idx) {
    
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
    const startDate = $('#startDate').val();
    let endDate = $('#endDate');
    const date_pattern = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/;
    if (!date_pattern.test(startDate)) {
        alert("StartDate Error");
    }
    if (endDate.length === 0 || !date_pattern.test(endDate.val())) {
        endDate = getTimeStamp();
        endDate.val(endDate);
    }
    socket.emit('search', {startDate: startDate, endDate: endDate});
}

$("#dv1").scroll(function () {
    const elem = $("#dv1");
    if (elem[0].scrollHeight - elem.scrollTop() === elem.outerHeight()) {
    }
});