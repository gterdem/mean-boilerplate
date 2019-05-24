const jsonfile = require('jsonfile');
const path = require('path');
const { logger } = require('./logger');

const { Role } = require('./src/models/role');
const { User } = require('./src/models/user');

const { permissionManager } = require('./src/permissions');

const initializePermissionsAsync = async () => {
  await permissionManager.initializeAsync();
  console.log("Permission initialization completed...");
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
  let adminUser = await User.findOne(adminUserQuery);
  if (adminUser == null) {
    adminUser = {
      email: "admin@admin.com",
      profile: {
        name: "Galip Tolga",
        lastName: "Erdem"
      },
      roles: [adminRole]
    };
    User.register(adminUser, "123qwe", (result) => {
      if (result === null) {
        console.log("admin user created...");
        return adminUser;
      } else {
        console.log(result.message);
      }
    })
  } else {
    return adminUser;
  }


}


const onAppStart = async () => {
  try {
    await initializePermissionsAsync();
    const adminUser = await createAdminUser();
    const permissions = await permissionManager.GetUserPermissionsByIdAsync(adminUser._id);
    const dodo = permissions;
  } catch (error) {
    logger.error('Seed error', { metadata: error });
    console.log('---> on start Error: ');
    console.log(error)
  }
};

module.exports = { onAppStart };