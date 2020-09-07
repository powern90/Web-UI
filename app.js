let createError = require('http-errors');
let express = require('express');
let path = require('path');
// let cookieParser = require('cookie-parser');
// let logger = require('morgan');
let Srv = require('./srv');
let MySQLStore  = require("express-mysql-session");
var min = 10000;

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
    }),
    cookie: {expires: new Date(Date.now() + min)}
});
MySQLStore(session);
let mysql = require('mysql'); //mysql 모듈을 로딩.
let bodyParser = require("body-parser");
const sharedsession = require("express-socket.io-session");

let indexRouter = require('./routes/index');
let checkRouter = require('./routes/check');
let boardRouter = require('./routes/board');
let crollRouter = require('./routes/croll_log')

let connection = mysql.createConnection({
    host: '192.168.1.7', // DB가 위치한 IP 주소
    port: 3306,          // DB와 연결할 포트번호
    user: 'test',        // 계정이름
    password: '1234',    // 계정 비밀번호
    database: 'board02'    // 데이터베이스 이름
});

let connection2 = mysql.createConnection({
    host: '192.168.1.4', // DB가 위치한 IP 주소
    port: 3306,          // DB와 연결할 포트번호
    user: 'gajok',        // 계정이름
    password: '1234!',    // 계정 비밀번호
    database: 'crolls'    // 데이터베이스 이름
});

let app = express();

app.use(session);
app.use(express.urlencoded({extended: true}))
app.use('/', express.static(__dirname + '/www')); // redirect root
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(express.json());
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/check', checkRouter);
app.use('/board', boardRouter);
app.use('/log', crollRouter);

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
app.io.on("connection", function (socket) {
    create(socket.handshake.session,25 ,function(){});
    var result;
    socket.on('req', function (data) {
        if (data.delete === true) {
            deleteboard(data, socket.handshake.session.isEditing, socket.handshake.session, function () {});
        }
        else{
            checkUpdate(data.update, socket.handshake.session.isEditing, socket.handshake.session, function () {                      //바꿔야함
            });
            getPost(socket.handshake.sessionID, data.click, socket.handshake.session, function (res_post) {
                scroll(socket.handshake.session.scroll_idx, data.next, socket, function (res_scroll) {
                    searchIdx(data.search, data.parm.i, socket, function (res_idx) {
                        searchKeyword(data.search, data.parm.k, socket, function (res_key) {
                            searchdate(data.search, data.parm.d, socket, function (res_date) {
                                searchgob(data.search, data.parm.g, socket, function (res_gob) {
                                    result = res_scroll !== null ? result = res_scroll : res_idx !== null ? result = res_idx : res_key !== null ? result = res_key : res_post !== null ? result = res_post : res_date !== null ? result = res_date : res_gob !== null ? result = res_gob : result = null;
                                    socket.emit('send', {
                                        list: result,
                                        isSearch: socket.handshake.session.isSearch,
                                        blue: socket.handshake.session.blue
                                    });
                                    socket.handshake.session.isSearch = false;
                                    socket.handshake.session.blue = false;              //바꿔야함
                                    socket.handshake.session.save();
                                });
                            });
                        });
                    });
                });
            });
        }
    });
    socket.on('disconnect', function(){
       console.log('disconnect: '+socket.handshake.sessionID);
    });
});

function getPost(id, idx, socket, callback) {
    let data = new Srv();
    if (idx !== null) {
        socket.isEditing = idx;
        const query = "select exists(select session_id, json_value(data, '$.isEditing')from " +
            "sessions where session_id not in(?)and json_value(data,'$.isEditing')=?)as idchk"
        connection2.query(query, [id, idx], function (err, rows) {
            data.isEditing = rows[0].idchk;
            connection.query('select * from test1 where idx=?', [idx], function (err, rows) {
                data.post = rows[0];
                callback(data);
            });
        });
    } else callback(null);
}

function checkUpdate(update, idx,socket, callback) {
    if (update !== null) {
        connection.query('update test1 set TITLE=?, AREA=?, DATE=?, TARGET=?, GOB=1 where idx=?',
            [update.title, update.area, update.date, update.target, idx], function (err, rows) {
                socket.blue = true;
                socket.save();                                                        //이 부분 다른 곳으로 옮기기
                const up = {idx: idx, title: update.title, area: update.area, date: update.date, target: update.target};
                app.io.emit('send', {list:up, isSearch:false, blue: true, idx2: idx });
                callback(null);

            });
    } else {
        callback(null);
    }
}

function deleteboard(delet, idx,socket, callback) {
    if(delet !== null){
        connection.query('delete from test1 where idx=?', [idx], function (err, rows) {
            //socket.delet = true;
            //socket.save();
            app.io.emit('send', {idx2 : idx, delet : true});
            callback(null);
        });
    }else{
        callback(null);
    }

}

function create(socket,idx, callback) {
    socket.scroll_idx = idx;
    socket.isSearch = false;
    socket.keyword = [];
    socket.keyword_idx = 0;
    socket.keyword_content = null;
    socket.date = [];
    socket.date_idx =0;
    socket.date_content = [];

    socket.blue = false;                          //바꿔야함
    socket.delet = false;
    socket.post = null;
    socket.isEditing = 0;
    socket.save();
    callback();
}
function scroll(curidx, isScroll,socket, callback) {
    if (isScroll !== false && socket.handshake.session.keyword.length === 0 && socket.handshake.session.date.length === 0 && curidx >=0) {
        connection.query('select idx, title, ctime, url,gob from test1 where idx > ? and idx <= ?',
            [curidx, curidx + 25], function (err, rows) {
                if (err) console.log(err);
                create(socket.handshake.session,curidx+25 ,function(){});
                callback(rows);
            })
    }
    else if(isScroll !== false && socket.handshake.session.keyword.length !== 0 && socket.handshake.session.date.length ===0){
        connection.query('select idx, title, ctime, url,gob from test1 where idx > ? and (title like ? or content like ?) limit 25',
            [socket.handshake.session.keyword_idx,socket.handshake.session.keyword_content, socket.handshake.session.keyword_content], function (err, rows) {
                if (err) console.log(err);
                if(rows.length ===0)
                    callback(null);
                else {
                    socket.handshake.session.keyword = rows;
                    socket.handshake.session.keyword_idx = rows[rows.length - 1].idx;
                    socket.handshake.session.save();
                    callback(rows);
                }
            })
    }
    else if(isScroll !== false && socket.handshake.session.keyword.length === 0 && socket.handshake.session.date.length !==0){
        connection.query('select idx, title, ctime, url,gob from test1 where idx > ? and ctime between ? and ? limit 25',
            [socket.handshake.session.date_idx, socket.handshake.session.date_content[0], socket.handshake.session.date_content[1]], function (err, rows) {
                if (err) console.log(err);
                if(rows.length ===0)
                    callback(null);
                else {
                    socket.handshake.session.date = rows;
                    socket.handshake.session.date_idx = rows[rows.length - 1].idx;
                    socket.handshake.session.save();
                    callback(rows);
                }
            })
    }
    else {
        callback(null);
    }
}
function searchIdx(isSearch, searchidx, socket,callback) {
    if (isSearch === true && searchidx !== null) {
        connection.query('select idx, title, ctime, url, gob from test1 where idx >= ? and idx <= ?',
            [searchidx, searchidx + 25], function (err, rows) {
                if (err) console.log(err);
                if(rows.length ===0) {
                    socket.handshake.session.isSearch = true;
                    callback(null);
                }
                else {
                    create(socket.handshake.session, searchidx + 25, function () {
                    });
                    socket.handshake.session.isSearch = true
                    socket.handshake.session.save();
                    callback(rows);
                }
            })
    } else {
        callback(null);
    }
}
function searchgob(isSearch, searchidx, socket,callback) {
    if (isSearch === true && searchidx !== null) {
        connection.query('select idx, title, ctime, url, gob from test1 where idx >= ? and idx <= ? and gob = 0',
            [searchidx[0], searchidx[1]], function (err, rows) {
                if (err) console.log(err);
                if(rows.length ===0) {
                    socket.handshake.session.isSearch = true;
                    callback(null);
                }
                else {
                    create(socket.handshake.session,-1 ,function(){});
                    socket.handshake.session.isSearch = true
                    socket.handshake.session.save();
                    callback(rows);
                }
            })
    } else {
        callback(null);
    }
}
function searchKeyword(isSearch, searchkeyword, socket, callback) {
    if (isSearch === true && searchkeyword !== null) {
        searchkeyword = "%" + searchkeyword + "%";
        connection.query('select idx, title, ctime, url, gob from test1 where idx > 0 and (title like ? or content like ?) limit 25',
            [searchkeyword, searchkeyword], function (err, rows) {
                if (err) console.log(err);
                if(rows.length ===0) {
                    socket.handshake.session.isSearch = true;
                    callback(null);
                }
                else {
                    create(socket.handshake.session, 25, function () {
                    });
                    socket.handshake.session.keyword = rows;
                    socket.handshake.session.keyword_idx = rows[rows.length - 1].idx;
                    socket.handshake.session.keyword_content = searchkeyword;
                    socket.handshake.session.isSearch = true;
                    socket.handshake.session.save();
                    callback(rows);
                }
            })
    } else {
        callback(null);
    }
}
function searchdate(isSearch, searchdate, socket, callback) {
    if (isSearch === true && searchdate !== null) {
        connection.query('select idx, title, ctime, url, gob from test1 where idx > 0 and ctime between ? and ? limit 25',
            [searchdate[0], searchdate[1]], function (err, rows) {
                if (err) console.log(err);
                if(rows.length ===0) {
                    socket.handshake.session.isSearch = true;
                    callback(null);
                }
                else {
                    create(socket.handshake.session, 25, function () {
                    });
                    socket.handshake.session.date = rows;
                    socket.handshake.session.date_idx = rows[rows.length - 1].idx;
                    socket.handshake.session.date_content = [searchdate[0], searchdate[1]];
                    socket.handshake.session.isSearch = true;
                    socket.handshake.session.save();
                    callback(rows);
                }
            })
    } else {
        callback(null);
    }
}

var io = require('socket.io').listen(81);
var net = require('net');

var server = net.createServer(function (stream) {
    stream.on("connect", function () {
        console.log("rendering client connected");
    });
    stream.on("data", function (data) {
        console.log(data.toString())
        var result = data.toString()
        socket.emit("from_py", result)
    });
});
server.listen(9090);

module.exports = app;