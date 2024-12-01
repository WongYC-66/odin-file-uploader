var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var filesRouter = require('./routes/files');
var folderRouter = require('./routes/folder');
var shareRouter = require('./routes/share');

// Prisma + express session
const passport = require('passport')
const expressSession = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');
// Prisma + express session

if (process.env.NODE_ENV !== 'production')
  require('dotenv').config()

var app = express();

// Prisma + express session
// Middleware to ensure database connectivity and initialize session store
let prisma;
let sessionStore;

// Middleware to initialize Prisma and check database connectivity
const initializePrisma = async () => {
  try {
    prisma = new PrismaClient();
    await prisma.$connect();
    console.log("Connected to the database.");
    return true;
  } catch (err) {
    console.error("Database connection error1:", err.message);
    prisma = null;
    return false;
  }
};

// Middleware to initialize PrismaSessionStore
const initializeSessionStore = async () => {
  if (!sessionStore && prisma) {
    try {
      sessionStore = new PrismaSessionStore(prisma, {
        checkPeriod: 60 * 60 * 1000, // Check expired sessions every hour
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      });
      console.log("PrismaSessionStore initialized.");
    } catch (err) {
      console.error("Failed to initialize PrismaSessionStore:", err.message);
      sessionStore = null;
    }
  }
};

app.use(async (req, res, next) => {
  const isDatabaseConnected = await initializePrisma();
  if (!isDatabaseConnected) {
    console.error("Database failure, check connectivitiy");
    // Send JSON response about database failure
    return res.status(503).json({
      success: false,
      message: "The database is currently offline. Please try again later.",
    });
  }
  await initializeSessionStore();
  next();
});

// Set up express-session with fallback
app.use(
  expressSession({
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
    secret: process.env.secret_key || 'fallback-secret-key',
    resave: true,
    saveUninitialized: true,
    store: sessionStore || undefined, // Use PrismaSessionStore if available
  })
);

// passpoth configuration set up
app.use(passport.session())
require('./passportConfig')

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
app.use('/files', filesRouter);
app.use('/folder', folderRouter);
app.use('/share', shareRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
