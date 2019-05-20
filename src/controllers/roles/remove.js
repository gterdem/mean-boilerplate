const { sendDeleted } = require('../../middleware/index');

const remove = ({ Role }) => async (req, res, next) => {
    try {
        const { _id } = req.params;
        const role = await Role.findOne({ _id });
        await Role.remove({ _id });
        return sendDeleted(res, { role });
    } catch (error) {
        next(error);
    }
};

module.exports = remove;
