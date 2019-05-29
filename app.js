const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const swaggerUi = require('swagger-ui-express');

const bodyParser = require('body-parser');
const { config } = require('./config');
const api = require('./src/api/index');
const { passport } = require('./src/passport');
const { mongoManager } = require('./src/mongo');
const { onAppStart } = require('./on-start');

const app = express();

mongoManager.connect();

// Loggers
app.use(morgan('combined'));
app.get('/', function (req, res) {
  res.send('Api Main Page is displayed here...');
});

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


const swaggerDocument = require('./swagger.json');

var options = {
  explorer: true
};
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

// on App start
onAppStart();

module.exports = app;
