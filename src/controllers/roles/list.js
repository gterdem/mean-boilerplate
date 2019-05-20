const { sendList } = require('../../middleware/index');
const { queryToObject } = require('../../utils/requests');

const list = ({ Roles }, { config }) => async (req, res, next) => {
    try {
        let { search, limit, skip } = queryToObject(req.query);

        skip = skip ? parseInt(skip, 10) : 0;
        limit = parseInt(limit, 10);
        limit = limit && limit < config.maxLimitPerQuery ? limit : config.maxLimitPerQuery;

        const query = { $and: [] };
        if (search) {
            query.$and.push({ $or: new Roles().fieldsToSearch(search) });
        }

        const count = await Roles.find(query).count();
        const result = await Roles.find(query)
            //.sort({ : 1 })
            .skip(skip)
            .limit(limit);

        return sendList(res, { result, count });
    } catch (error) {
        next(error);
    }
};

module.exports = { list };
