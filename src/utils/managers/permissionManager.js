const _ = require('lodash');
const { logger } = require('../../../logger');
const { Role } = require('../../models/role');
const { User } = require('../../models/user');

const user_permissions = require('./permission-users');
const role_permissions = require('./permission-roles');

const base = [
    {
        level: 0,
        parentName: null,
        name: "Pages",
        displayName: "Pages",
        description: null
    },
    {
        level: 1,
        parentName: "Pages",
        name: "Pages.Administration",
        displayName: "Administration",
        description: null
    }
]
const addPermissionToRole = async (roleId, permissionList) => {
    try {
        const role = await Role.findOne({ roleId });
        role.permissions = permissionList;
        role.save(done);
    } catch (error) {
        logger.error('Error when adding permissions to role', { metadata: error });
        next(error);
    }
}
const getUserPermissions = async (userId) => {
    const user = await User.findOne({ _id: userId })
        .populate('roles')
        .populate('roles.permissions')
        .exec();
    let mergedPermissions = [];
    user.roles.forEach(role => {
        mergedPermissions = _.union(mergedPermissions, role.permissions);
    });
    return mergedPermissions;
}
const permissionManager = {
    GetAllPermissions: () => {
        return [...base, ...user_permissions, ...role_permissions];
    },
    AddPermissionsToRole: addPermissionToRole,
    GetUserPermissions: getUserPermissions
}

module.exports = { permissionManager }