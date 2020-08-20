let createError = require('http-errors');
let express     = require('express');
let path        = require('path');
// let cookieParser = require('cookie-parser');
// let logger = require('morgan');
let MySQLStore  = require("express-mysql-session");
let session     = require("express-session")({
    secret              : 'ABCD1234ABAB!@',
    resave              : false,
    saveUninitialized   : true,
    store               : new MySQLStore({
        host: '192.168.1.4', // DB가 위치한 IP주소
        port: 3306,          // DB와 연결할 포트번호
        user: 'gajok',        // 계정이름
        password: '1234!',    // 계정 비밀번호
        database: 'crolls'    // 데이터베이스 이름
    })
});
MySQLStore(session);
let mysql       = require('mysql'); //mysql 모듈을 로딩.
let bodyParser  = require("body-parser");
const sharedsession = require("express-socket.io-session");

let indexRouter = require('./routes/index');
let checkRouter = require('./routes/check');
let boardRouter = require('./routes/board');

let connection = mysql.createConnection({
    host: '192.168.1.9', // DB가 위치한 IP 주소
    port: 3306,          // DB와 연결할 포트번호
    user: 'test',        // 계정이름
    password: '1234',    // 계정 비밀번호
    database: 'board02'    // 데이터베이스 이름
});

let app = express();

app.use(session);
app.use(express.urlencoded({ extended: true }))
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/check', checkRouter);
app.use('/board', boardRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.io = require('socket.io')();
app.io.use(sharedsession(session));
app.io.on("connection", function(socket) {
    socket.handshake.session.userdata = 1234;
    socket.handshake.session.save();
    socket.handshake.session.userdata = 2222;
    socket.handshake.session.save();
    console.log(socket.handshake.session.userdata);
});

module.exports = app;