const { sendOne } = require('../../middleware/index');

const get = ({ Role }) => async (req, res, next) => {
    try {
        const { _id } = req.params;
        const role = await Role.findOne({ _id });
        return sendOne(res, { role });
    } catch (error) {
        next(error);
    }
};

module.exports = get;
