const socket = io();

socket.on('send', function (data) {
    if(data.post!==null) {
        $('#form-title').val(data.post.TITLE);
        if($("#inserted").children().length > 0) $("#inserted").empty();
        $('#inserted').append(data.post.CONTENT);
    }
    console.log(data);
    if(data.isEditing) {
        $('#circle1').show();
    }
    else{
        $('#circle1').hide();
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
    let endDate = $('#endDate');
    const date_pattern = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/;
    if (!date_pattern.test(startDate)) {
        alert("StartDate Error");
    }
    if (endDate.length === 0 || !date_pattern.test(endDate.val())) {
        endDate = getTimeStamp();
        endDate.val(endDate);
    }
    data.parm.d.append(startDate);
    data.parm.d.append(endDate);
    data.search = true;
    send(data);
}

$("#dv1").scroll(function () {
    const elem = $("#dv1");
    if (elem[0].scrollHeight - elem.scrollTop() === elem.outerHeight()) {
    }
});