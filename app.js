const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
//const fs = require('fs');
const { sha256 } = require('js-sha256');
const requestIp = require('request-ip');
var status = require('statuses');
const Database = require('./database');

//const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
const db = new Database('./database.json');

if (!db.has('visitors')) {
  db.set('visitors', 0);
}
if (!db.has('visitorhashes')) {
  db.set('visitorhashes', []);
}

function getNumberWithOrdinal(n) {
  var s = ["th", "st", "nd", "rd"],
      v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//const Counterpath = path.join(__dirname, 'counter.txt');

//if (!fs.existsSync(Counterpath)) fs.writeFileSync(Counterpath, '0');

app.get('/', function(req, res, next) {
  let count = db.get('visitors');
  if (!db.get('visitorhashes').includes(sha256(requestIp.getClientIp(req)))) {
    db.add('visitors', 1);
    db.push('visitorhashes', sha256(requestIp.getClientIp(req)));
    count++;
  }
  res.render('index', { count: getNumberWithOrdinal(count) });
});

app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler

/**
 * 
 * @param {any} err 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 * @returns 
 */
function errorhandler(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  
  // only render if encoding isnt json/plain/xml
  if (!req.query.encoding) return res.render('error');

  switch (req.query.encoding) {
    case "plain":
      res.type('txt').send(status(err.status || 500));
      break;
    case "json":
      res.json({ status: err.status, message: status(err.status || 500) });
      break;
    case "xml":
      //i hate making xml
      res.type('xml').send(`
<dumorando>
  <status>${err.status}</status>
  <message>${status(err.status || 500)}</message>
</dumorando>
      `.trim());
      break;
    case "human":
      res.render('error');
      break;
    default:
      res.type('txt').send('invalid encoding');
      break;
  }
}

app.use(errorhandler);

module.exports = app;