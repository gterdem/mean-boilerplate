const express = require('express');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerMerger = require('swagger-merger')

const bodyParser = require('body-parser');
const { config } = require('./config');
const api = require('./src/api/index');
const { passport } = require('./src/passport');
const { mongoManager } = require('./src/mongo');
const { onAppStart } = require('./on-start');

const { errorLogger, logger, requestLogger } = require('./logger');

const app = express();
// swagger docs
mongoManager.connect();

// Loggers
app.use(morgan('combined'));
app.use(errorLogger);
// app.use(requestLogger);
// app.use(logger('dev'));
app.get('/', function (req, res) {
  res.send('hello, world!')
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// middleware
app.use(bodyParser.json({
  limit: config.bodyLimit,
}));

// Authorization
app.use(passport.init());

// api routes v1
app.use('/api/v1', api(config));


// register api doc
// const outputSwaggerDir = path.resolve(config.swaggerDirPath, './build');
// const swaggerBuildFilePath = path.resolve(outputSwaggerDir, './swagger.yaml');

// if (!fs.existsSync(outputSwaggerDir)) {
//   fs.mkdirSync(outputSwaggerDir);
// }
// swaggerMerger({ input: config.swaggerFilePath, output: swaggerBuildFilePath });
// const swaggerDocument = YAML.load(swaggerBuildFilePath);
const swaggerDocument = require('./swagger.json');

var options = {
  explorer: true
};
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

// on App start
onAppStart();
// const port = process.env.PORT;
// app.listen(port, () => {
//   console.log(`Server is listening on port ${port}`);
// })

module.exports = app;
