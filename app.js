const express = require('express');
const http = require('http');
const path = require('path');
const config = require('./config');
const HttpError = require('./error').HttpError;

const app = express();
app.engine('ejs', require('ejs-locals'));
app.set('port', config.get('port'));

app.set('views', path.join(__dirname,   'views'));
app.set('view engine', 'ejs');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());

var MongoStore = require('connect-mongo')(express);
app.use(express.session({
  secret: config.get('session:secret'),
  key: config.get('session:key'),
  cookie: config.get('session:cookie'),
  store: new MongoStore({
    host: '127.0.0.1',
    port: '27017',
    db: 'session',
    url: 'mongodb://localhost:27017/demo'
  })
}));

app.use(require('./middleware/sendHttpError'));
app.use(require('./middleware/loadUser'));

app.use(app.router);
require('./routes')(app);
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(err, req, res, next) {
  if (typeof err == 'number') {
    err = new HttpError(err);
  }

  if (err instanceof HttpError) {
    res.sendHttpError(err);
  } else {
    if (app.get('env') == 'development') {
      express.errorHandler()(err, req, res, next);
    } else {
      log.error(err);
      err = new HttpError(500);
      res.sendHttpError(err);
    }
  }
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + config.get('port'));
});
