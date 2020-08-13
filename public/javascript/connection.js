var socket = io();

function receive() {
    socket.on('send', function(data){
       //data가 sender객체
       //하나씩 값 확인해서 해당부분 처리하면 됨
    });
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
    if(!date_pattern.test(startDate)){
        alert("StartDate Error");
    }
    if(endDate.length === 0) endDate = getTimeStamp();
    if(!date_pattern.test(endDate)){
        alert("EndDate Error");
    }
    socket.emit('search', {startDate: startDate, endDate: endDate});
}

function send(data) {
    socket.emit('req', data);
}
