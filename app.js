const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const logger = require('morgan');
const path = require('path');
const fileUpload = require('express-fileupload');

const mongoose = require('./models/index');
const routes = require('./routes/index.route');

const app = express();
const PORT = 8000
// const PORT = process.env.PORT || 8080

// Only when local
const corsOptions = {
    origin: "http://localhost:"+ PORT
}
app.use(fileUpload())
// app.use(cors(corsOptions));
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(logger('dev'));
app.use(cookieParser());
app.use("/", routes)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send("")
    // res.render('error', {
    //   message: err.message,
    //   error: err
    // });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send("")

  // res.render('error', {
  //   message: err.message,
  //   error: {}
  // });
});

app.listen(PORT, () => console.log("listeing on port " + PORT))
