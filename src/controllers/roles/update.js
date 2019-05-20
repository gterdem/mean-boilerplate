const _ = require('lodash');
const { sendUpdated } = require('../../middleware/index');

const update = ({ Role }) => async (req, res, next) => {
    try {
        const { _id } = req.params;
        const role = await Role.findOne({ _id });
        _.extend(role, req.body);

        await role.save();
        return sendUpdated(res, { role });

    } catch (error) {
        next(error);
    }
};

module.exports = update;
