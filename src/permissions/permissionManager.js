const _ = require('lodash');
const { logger } = require('../../logger');
const { Role } = require('../models/role');
const { User } = require('../models/user');
const fs = require('fs');

const permissionPath = './src/permissions/';

let allPermissions = [];
const initializeAsync = async () => {
    await readPermissionFilesAsync(permissionPath)
        .then((fileNames) => {
            return Promise.all(fileNames.map((f => getFileAsync(permissionPath, f))));
        })
        .then((files) => {
            files.forEach(function (file) {
                var json_array = JSON.parse(file);
                json_array.forEach((permission) => {
                    allPermissions.push(permission)
                });
            })
        });
}
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
const getPermissionByName = (permissionName) => {
    return allPermissions.filter(f => f.name === permissionName);
}

const permissionManager = {
    initializeAsync: initializeAsync,
    GetAllPermissions: () => { return allPermissions; },
    AddPermissionsToRole: addPermissionToRole,
    GetUserPermissions: getUserPermissions,
    GetPermissionByName: getPermissionByName
}

module.exports = { permissionManager };

/** Helper methods */
const readPermissionFilesAsync = (dirname) => {
    return new Promise(function (resolve, reject) {
        fs.readdir(dirname, function (err, filenames) {
            filenames = filenames.filter(t => t.endsWith('.json'));
            if (err)
                reject(err);
            else
                resolve(filenames);
        });
    });
};
const getFileAsync = (path, filename) => {
    return readFileAsync(path + filename, 'utf8');
}
const readFileAsync = (filename, enc) => {
    return new Promise(function (resolve, reject) {
        fs.readFile(filename, enc, function (err, data) {
            if (err)
                reject(err);
            else
                resolve(data);
        });
    });
};
