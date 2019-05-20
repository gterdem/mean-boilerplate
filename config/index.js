const devConfig = require('./config.dev');
const prodConfig = require('./config.prod');

const type = process.env.NODE_ENV === undefined ? "development" : process.env.NODE_ENV;
console.log(`Environment: ${type}`);
const configs = {
  development: devConfig,
  production: prodConfig
};

module.exports = {
  config: configs[type] || configs.development,
};