let createError = require('http-errors');
let express = require('express');
let path = require('path');
// let cookieParser = require('cookie-parser');
// let logger = require('morgan');
let Send = require('./sender');
let Watcher = require('./watcher');
let Post = require('./public/javascript/post');
let mysql = require('mysql'); //mysql 모듈을 로딩.
let connection = mysql.createConnection({
    host: '192.168.1.9', // DB가 위치한 IP 주소
    port: 3306,          // DB와 연결할 포트번호
    user: 'test',        // 계정이름
    password: '1234',    // 계정 비밀번호
    database: 'board02'    // 데이터베이스 이름
});

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let boardRouter = require('./routes/board');

let app = express();

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
app.use('/users', usersRouter);
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

module.exports = app;

let watcher = new Watcher();
app.io = require('socket.io')();
app.io.on('connection', function (socket) {
    watcher.add_user(socket.id);
    socket.on('req', function (data) {
        let send = new Send();
        checkWatcher(socket.id, data.click.idx, function (isEditing) {
            checkClick(data.click.idx, function (post) {
                checkUpdate(data.save.update, function () {
                });
                scroll(data.scroll.curidx, function (result) {
                    searchIdx(data.search.condition, data.search.idx, function (result_idx) {
                        searchKeyword(data.search.condition, data.search.keyword, function (result_keyword) {
                            if (result.length != 0)
                                send.list = send.list.concat(result.data);
                            send.isScroll = result.isScroll;
                            if (result_idx.isSearch != 0)
                                send.list = send.list.concat(result_idx.data);
                            send.isSearch += result_idx.isSearch;
                            send.list = send.list.concat(result_keyword.data);
                            send.isSearch += result_keyword.isSearch;
                            send.red = isEditing;
                            send.post = post;
                            socket.emit('send', send);
                        })
                    })
                })
            });
        });
    });

    socket.on('disconnect', function () {
        console.log("SOCKET IO disconnect EVENT: ", socket.id, " client disconnect");
        watcher.disconnect(socket.id);
    });
});

function checkWatcher(id, idx, callback) {
    callback(watcher.editing(id, idx));
}

function checkClick(idx, callback) {
    let post = new Post();
    if (idx !== null) {
        connection.query('select idx,title from test1 where idx=?', [idx], function (err, rows) {
            post.idx = idx;
            post.title = rows[0].title;
            callback(post);
        });
    } else callback(post);
}

function scroll(curidx, callback) {
    if (curidx != null) {
        connection.query('select idx, title, ctime, url from test1 where idx > ? and idx <= ?', [curidx, curidx + 25], function (err, rows) {
            if (err) console.log(err);
            callback({data: rows, isScroll: true});
        })
    } else {
        callback([]);
    }
}

function searchIdx(search, searchidx, callback) {
    if (search === 1) {
        connection.query('select idx, title, ctime, url from test1 where idx >= ? and idx <= ?', [searchidx, searchidx + 25], function (err, rows) {
            if (err) console.log(err);
            callback({data: rows, isSearch: 1});
        })
    } else {
        callback({data: null, isSearch: 0});
    }
}

function searchKeyword(search, searchkeyword, callback) {
    if (search === 3) {
        searchkeyword = "%" + searchkeyword + "%";
        connection.query('select idx, title, ctime, url from test1 where title like ? or content like ?', [searchkeyword, searchkeyword], function (err, rows) {
            if (err) console.log(err);
            callback({data: rows, isSearch: 1});
        })
    } else {
        callback({data: null, isSearch: 0});
    }
}

function checkUpdate(update, callback) {
    if (update.idx !== null) {
        connection.query('update test1 set TITLE=?, AREA=?, DATE=?, TARGET=? where idx=?',
            [update.title, update.area, update.date, update.target, update.idx], function (err, rows) {
                callback();
            });
    } else {
        callback();
    }
}

function sendUpdate(new_data, callback) {

}