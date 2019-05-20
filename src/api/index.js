const express = require('express');

const { errorHandler } = require('../middleware/index');
const { Image } = require('../models/image');
const { User } = require('../models/user');
const { Role } = require('../models/role');
const { Car } = require('../models/car');

const auth = require('../controllers/auth');
const images = require('../controllers/images');
const users = require('../controllers/users');
const roles = require('../controllers/roles');
const cars = require('../controllers/cars');
const permissions = require('../controllers/permission');

const models = { User, Role, Car, Image };

const routersInit = config => {
  const router = express();

  router.use('/auth', auth(models, { config }));
  router.use('/users', users(models, { config }));
  router.use('/roles', roles(models, { config }));
  router.use('/cars', cars(models, { config }));
  router.use('/images', images(models, { config }));
  router.use('/permissions', permissions());

  router.use(errorHandler);
  return router;
};

module.exports = routersInit;
