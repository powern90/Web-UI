var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Send = require('./sender')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var boardRouter = require('./routes/board');

var app = express();

var mysql = require('mysql');
var connection = mysql.createConnection({
  host: '192.168.1.9',
  port: 3306,
  user: 'test',
  password: '1234',    // 계정 비밀번호
  database: 'board02'    // 데이터베이스 이름
});

app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/board', boardRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

app.io = require('socket.io')();
app.io.on('connection', function(socket){
  socket.on('req', function(data){
    var send = new Send();

    scroll(data.scroll.curidx,function(result){
      searchIdx(data.search.condition, data.search.idx, function(result_idx){
        searchKeyword(data.search.condition, data.search.keyword, function(result_keyword){
          if(result.length != 0)
            send.list = send.list.concat(result.data);
          send.isScroll = result.isScroll;
          if(result_idx.isSearch != 0)
            send.list = send.list.concat(result_idx.data);
          send.isSearch += result_idx.isSearch;
          send.list = send.list.concat(result_keyword.data);
          send.isSearch += result_keyword.isSearch;
          socket.emit('send',send);
        })
      })
    })
  });
});

function scroll(curidx,callback){
  if(curidx != null) {
    connection.query('select idx, title, ctime, url from test1 where idx > ? and idx <= ?', [curidx, curidx + 25], function (err, rows) {
      if (err) console.log(err);
      callback({data: rows, isScroll:true});
    })
  }
  else{
    callback([]);
  }
}
function searchIdx(search, searchidx,callback){
  if(search === 1){
    connection.query('select idx, title, ctime, url from test1 where idx >= ? and idx <= ?', [searchidx, searchidx + 25], function (err, rows) {
      if (err) console.log(err);
      callback({data: rows, isSearch:1});
    })
  }
  else{
    callback({data:null,isSearch:0});
  }
}
function searchKeyword(search, searchkeyword, callback){
  if(search === 3){
    searchkeyword = "%" +searchkeyword + "%";
    connection.query('select idx, title, ctime, url from test1 where title like ? or content like ?', [searchkeyword, searchkeyword], function (err, rows) {
      if (err) console.log(err);
      callback({data: rows, isSearch:1});
    })
  }
  else{
    callback({data:null,isSearch:0});
  }
}
socket