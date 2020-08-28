const socket = io();

socket.on('from_py', function (data) {
    var encode = data.toString();
    var result = encode.split("+");
    $('#dv1').append("<p>" ,result[0],"</p> \n <p>", result[1] , "</p>\n\n");
    const $messageTextBox = $('#dv1');
    $messageTextBox.scrollTop($messageTextBox[0].scrollHeight);
})

socket.on('from_py_rc', function (data) {
    var encode = data.toString();
    var result = encode.split("+");
    $('#ram').text(result[0] + "%");
    $('#cpu').text(result[1] + "%");
})
