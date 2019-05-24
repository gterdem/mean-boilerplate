const express = require('express');

const { errorHandler } = require('../middleware/index');
const { Image } = require('../models/image');
const { User } = require('../models/user');
const { Role } = require('../models/role');

const auth = require('../controllers/auth');
const images = require('../controllers/images');
const users = require('../controllers/users');
const roles = require('../controllers/roles');
const permissions = require('../controllers/permission');

const models = { User, Role, Image };
const authorize = {};

const routersInit = config => {
  const router = express();

  router.use('/auth', auth(models, { config }));
  router.use('/users', users(models, { config }));
  router.use('/roles', roles(models, { config }, authorize));
  router.use('/images', images(models, { config }));
  router.use('/permissions', permissions());

  router.use(errorHandler);
  return router;
};

module.exports = routersInit;
