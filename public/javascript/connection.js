const socket = io();

socket.on('send', function (data) {

    let i;
    let deletable = $('#deleteable');
    if(data.isSearch === true){
        deletable.empty();
        const $messageTextBox = $('#dv1');
        $messageTextBox.scrollTop(0);
    }
    if(data.list != null && data.blue===false) {
        for (i = 0; i < data.list.length; i++) {
            if(data.list[i].gob==true){
                $('#blue_'+data.list[i].idx).show();
            }
            deletable.append("<div class=".concat('"card" onclick="post_onClick(', data.list[i].idx, ')">\n',
                '<div class="container-fluid">\n' +
                '<div class="card-body">\n' +
                '<p class="card-columns" id="idx">', data.list[i].idx, '</p>\n',
                '<h5 class="card-title" id="title">', data.list[i].title, '</h5>\n',
                '<p class="card-text" id="date">', data.list[i].ctime,
                '<p class="card-text" id=blue_', data.list[i].idx, '>💙</p>\n' + '<p class="card-text" id="from">',
                data.list[i].url, '</p>', '</div>\n' +
                '</div>\n' +
                '</div>'));
        }

        if (data.list.post !== null) {
            $('#form-title').val(data.list.post.TITLE);
            if ($("#inserted").children().length > 0) $("#inserted").empty();
            $('#inserted').append(data.list.post.CONTENT);
        }
        if (data.list.isEditing) {
            $('#circle1').show();
        } else {
            $('#circle1').hide();
        }
    }
    if(data.blue){
        $('#title_'+ data.idx2).text(data.list.title);
        $('#blue_'+ data.idx2).show();
    }
});

function post_onClick(idx) {
    let data = new cli();
    console.log(idx);
    data.click = idx;
    send(data);
}

function send(data) {
    console.log('Data Send: ');
    console.log(data);
    socket.emit('req', data);
}

function submit_update() {
    const post = new Post();
    let data = new cli();
    post.title = $('#form-title').val();
    post.area = $('#form-area').val();
    post.date = $('#form-date').val();
    post.support = $('#form-support').val();
    post.target = $('#form-target').val();
    data.update = post;
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
    let data = new cli();
    const startDate = $('#startDate').val();
    let endDatesel = $('#endDate');
    const date_pattern = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/;
    if (!date_pattern.test(startDate)) {
        alert("StartDate Error");
        return;
    }
    let endDate = endDatesel.val();
    console.log(endDatesel.val().length);
    if (endDatesel.val().length === 0 || !date_pattern.test(endDatesel.val())) {
        endDate = getTimeStamp();
        endDatesel.val(endDate);
    }
    data.parm.d= [startDate, endDate];
    console.log(data.parm.d);
    data.search = true;
    send(data);
}

$("#dv1").scroll(function () {
    const elem = $("#dv1");
    if (elem[0].scrollHeight - elem.scrollTop() === elem.outerHeight()) {
        const client = new cli();
        client.next = true;
        send(client);
    }
});
function search_idx() {
    const value = $('#sidx').val();
    let client = new cli();
    client.parm.i = parseInt(value);
    client.search = true;
    send(client);
}
function search_keyword(){
    const value = $('#kidx').val();
    let client = new cli();
    client.parm.k = value;
    client.search = true;
    send(client);
}
function search_gob() {
    const value1 = $('#gobidx1').val();
    const value2 = $('#gobidx2').val();
    let client = new cli();
    client.parm.g = [parseInt(value1), parseInt(value2)];
    client.search = true;
    send(client);
}

function send(data) {
    socket.emit('req', data);
}
