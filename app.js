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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

app.io = require('socket.io')();
app.io.on('connection', function(socket){
  socket.on('req', function(data){
    var send = new Send();

    scroll(data.scroll.curidx,function(result){
      search(data.search.condition, data.search.idx, function(result_search){
        if(result.length != 0)
          send.list = send.list.concat(result.data);
        send.isScroll = result.isScroll;
        send.list = send.list.concat(result_search.data);
        send.isSearch = result_search.isSearch;
        socket.emit('send',send);
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
function search(search, searchidx,callback){
  if(search != null){
    connection.query('select idx, title, ctime, url from test1 where idx >= ? and idx <= ?', [searchidx, searchidx + 25], function (err, rows) {
      if (err) console.log(err);
      callback({data: rows, isSearch:true});
    })
  }
  else{
    callback([]);
  }
}