const { Router: router } = require('express');
const { authenticate } = require('../../middleware');
const update = require('./update');
const create = require('./create');
const remove = require('./remove');
const get = require('./get');
const { list } = require('./list');


/**
 * Provide Api for Roles

 GET /api/v1/roles/ - List
 @header
      Authorization: Bearer {token}

 GET /api/v1/roles/:_id - get single
 @header
        Authorization: Bearer {token}

 POST /api/v1/roles/ - Create
 @header
      Authorization: Bearer {token}
 @param
       name (require) - {string}

 PUT /api/v1/roles/:_id - Update
 @header
        Authorization: Bearer {token}
 @param
       name - {string}

 DELETE /api/v1/roles/:_id - Remove
 @header
        Authorization: Bearer {token}

 **/

module.exports = (models, { config }) => {
       const api = router();

       api.get('/', authenticate, list(models, { config }));
       api.get('/:_id', authenticate, get(models));
       api.post('/', authenticate, create(models));
       api.put('/:_id', authenticate, update(models));
       api.delete('/:_id', authenticate, remove(models));

       return api;
};