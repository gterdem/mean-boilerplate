require('winston-mongodb');
const winston = require('winston');
const { mongoManager } = require('./src/mongo/MongoManager');

// your centralized logger object
let logger = winston.createLogger({
  transports: [
    new (winston.transports.MongoDB)({ db: mongoManager.getMongoUrl() })
  ],
  exitOnError: false, // do not exit on handled exceptions
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
// module.exports = logger;
const remoteLog = new winston.transports.Http({
  host: "localhost",
  port: process.env.PORT || 3000,
  path: "/errors"
});
const consoleLog = new winston.transports.Console();
module.exports = {
  requestLogger: createRequestLogger([consoleLog]),
  errorLogger: createErrorLogger([remoteLog, consoleLog]),
  logger: createDefaultLogger()
}

function createDefaultLogger() {
  const mongoDbLogger = winston.createLogger({
    transports: [
      new (winston.transports.MongoDB)({ db: mongoManager.getMongoUrl() })
    ], exitOnError: false,
  });
  return mongoDbLogger;
}

function createRequestLogger(transports) {
  const requestLogger = winston.createLogger({
    format: getRequestLogFormatter(),
    transports: transports
  })

  return function logRequest(req, res, next) {
    requestLogger.info({ req, res })
    next()
  }
}
function createErrorLogger(transports) {
  const errLogger = winston.createLogger({
    level: 'error',
    transports: transports
  })

  return function logError(err, req, res, next) {
    errLogger.error({ err, req, res })
    next()
  }
}
function getRequestLogFormatter() {
  const { combine, timestamp, printf } = winston.format;

  return combine(
    timestamp(),
    printf(info => {
      const { req, res } = info.message;
      return `${info.timestamp} ${info.level}: ${req.hostname} ${req.port || ''} ${req.originalUrl}`;
    })
  );
}

