require('winston-mongodb');
const winston = require('winston');
const { mongoManager } = require('./src/mongo/MongoManager');

// your centralized logger object
// let logger = winston.createLogger({
//   transports: [
//     new (winston.transports.MongoDB)({ db: mongoManager.getMongoUrl() })
//   ],
//   exitOnError: false, // do not exit on handled exceptions
// });

// if (process.env.NODE_ENV !== 'production') {
//   logger.add(new winston.transports.Console({
//     format: winston.format.simple()
//   }));
// }
module.exports = {
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

