const { sendOne } = require('../../middleware');
const { permissionManager } = require('../../permissions');

const signIn = (req, res) => {
  const { token, user } = req;
  permissionManager.CreateUserInfoCache(user._id);
  return sendOne(res, { user, token });
};

module.exports = signIn;
