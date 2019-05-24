const { sendList } = require('../../middleware/index');
const { queryToObject } = require('../../utils/requests');
const { permissionManager } = require('../../permissions');
const { APIError } = require('rest-api-errors');

const list = ({ Role }, { config }, requiredPermissions) => async (req, res, next) => {
    try {
        const authorizationResult = await permissionManager.AuthorizeAsync(req.user.id, requiredPermissions);
        if (!authorizationResult) {
            throw new APIError(403, "Forbidden", `You need at least one of these permissions: ${authorizationResult}`);
        }
        let { search, limit, skip } = queryToObject(req.query);

        skip = skip ? parseInt(skip, 10) : 0;
        limit = parseInt(limit, 10);
        limit = limit && limit < config.maxLimitPerQuery ? limit : config.maxLimitPerQuery;

        let query = {};
        if (search) {
            query = { $and: [] }
            query.$and.push({ $or: new Role().fieldsToSearch(search) });
        }
        const count = await Role.find(query).countDocuments();
        const result = await Role.find(query)
            //.sort({ : 1 })
            .skip(skip)
            .limit(limit);

        return sendList(res, { result, count });
    } catch (error) {
        next(error);
    }
};


module.exports = { list };
