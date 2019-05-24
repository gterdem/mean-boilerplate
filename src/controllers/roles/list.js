const { sendList } = require('../../middleware/index');
const { queryToObject } = require('../../utils/requests');
const { permissionManager } = require('../../permissions');

const list = ({ Role }, { config }, requiredPermissions) => async (req, res, next) => {
    try {
        // Authorization of the method -> Should have a better way
        // Failed authorization is catched and forwarded with message.
        await permissionManager.AuthorizeAsync(req.user.id, requiredPermissions);
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
