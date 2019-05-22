const { Router: router } = require('express');
const { sendList } = require('../../middleware/index');

const { permissionManager } = require('../../permissions');

const permissions = permissionManager.GetAllPermissions();

module.exports = () => {
    const api = router();

    api.get('/', (req, res, next) => {
        try {
            return sendList(res, { permissions });
        } catch (error) {
            next(error);
        }
    });
    // api.get('/:_level', get(models));
    return api;
};