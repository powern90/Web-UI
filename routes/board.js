var express = require('express');
var router = express.Router();
var mysql = require('mysql'); //mysql 모듈을 로딩.
var connection = mysql.createConnection({
    host: '192.168.1.9', // DB가 위치한 IP주소
    port: 3306,          // DB와 연결할 포트번호
    user: 'test',        // 계정이름
    password: '1234',    // 계정 비밀번호
    database: 'board02'    // 데이터베이스 이름
});

/* GET chat listing. */
router.get('/', function(req, res, next) {
    var query = connection.query('select idx, title, ctime, url from test1 where idx > 0 and idx <= 25', function (err, rows) {
        if (err) console.log(err)        // 만약 에러값이 존재한다면 로그에 표시합니다.
        console.log(rows);
        res.render('board', {rows: rows}); // view 디렉토리에 있는 list 파일로 이동합니다.
    });
});

module.exports = router;