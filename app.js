const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs');
const { sha256 } = require('js-sha256');
const requestIp = require('request-ip');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const Counterpath = path.join(__dirname, 'counter.txt');
const HashedIps = [];

if (!fs.existsSync(Counterpath)) fs.writeFileSync(Counterpath, '0');

app.get('/', function(req, res, next) {
  let count = parseInt(fs.readFileSync(Counterpath, 'utf-8'));
  let numsuf = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th']; //credit to godslayerakp
  if (!HashedIps.includes(sha256(requestIp.getClientIp(req)))) {
    fs.writeFileSync(Counterpath, String(count+1));
    count++;
    HashedIps.push(sha256(requestIp.getClientIp(req)));
  }
  res.render('index', { count: count + numsuf[parseInt(String(count).slice(-1))] });
});

app.use('/users', usersRouter);

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
