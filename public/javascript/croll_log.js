const socket = io();

socket.on('from_py', function (data) {
    var encode = data.toString();
    var result = encode.split("+");
    if(result[0]==="error"){
        $('#dv2').append("<strong>".concat(result[0], "</strong> <br> <a href='", result[1], "' target = \"_blank\" >", result[1], "</a><br><br>"));
        const $messageTextBox = $('#dv2');
        $messageTextBox.scrollTop($messageTextBox[0].scrollHeight);
    }
    else {
        $('#dv1').append("<strong>".concat(result[0], "</strong> <br> <a href='", result[1], "' target = \"_blank\" >", result[1], "</a><br><br>"));
        const $messageTextBox = $('#dv1');
        $messageTextBox.scrollTop($messageTextBox[0].scrollHeight);
    }
})

socket.on('from_py_rc', function (data) {
    var encode = data.toString();
    var result = encode.split("+");
    $('#ram').text(result[0] + "%");
    $('#cpu').text(result[1] + "%");
})
