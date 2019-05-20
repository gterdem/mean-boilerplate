const _ = require('lodash');
const { sendCreated } = require('../../middleware/index');

const create = ({ Role }) => async (req, res, next) => {
    try {
        const role = new Role({ name });
        _.extend(role, req.body);

        await role.save();
        return sendCreated(res, { role });

    } catch (error) {
        next(error);
    }
};

module.exports = create;
