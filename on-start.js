const jsonfile = require('jsonfile');
const path = require('path');
const { logger } = require('./logger');

const { Role } = require('./src/models/role');
const { User } = require('./src/models/user');

const { permissionManager } = require('./src/utils/managers');

const addCatalogs = async () => {
  // const count = await Models.find({}).count();
  // if (!count) {
  const file = path.resolve(__dirname, './private/assets', './model.json');
  jsonfile.readFile(file, async (err, catalogsJSON) => {
    if (err) throw err;

    for (let index = 0; index < catalogsJSON.length; index++) {
      // const model = new Model(catalogsJSON[index]);
      // await model.save();
    }
  });
  // }
};
const createAdminUser = async () => {
  const allPermissions = permissionManager.GetAllPermissions();
  let roleQuery = { name: "admin" };
  let roleUpdate = {
    name: "admin",
    permissions: allPermissions,
  };
  let roleOptions = { upsert: true, new: true, setDefaultsOnInsert: true };
  const adminRole = await Role.findOneAndUpdate(roleQuery, roleUpdate, roleOptions);

  let adminUserQuery = { email: "admin@admin.com" };
  let adminUserUpdate = {
    email: "admin@admin.com",
    profile: {
      name: "Galip Tolga",
      lastName: "Erdem"
    },
    roles: [adminRole]
  };
  let adminUserOptions = { upsert: true, new: true, setDefaultsOnInsert: true };
  const adminUser = await User.findOneAndUpdate(adminUserQuery, adminUserUpdate, adminUserOptions);
  const userPermissions = await permissionManager.GetUserPermissions(adminUser._id);
}


const onAppStart = async () => {
  try {
    await createAdminUser();
  } catch (error) {
    logger.error('Seed error', { metadata: error });
    console.log('---> on start Error: ');
    console.log(error)
  }
};

module.exports = { onAppStart };