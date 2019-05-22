const _ = require('lodash');
const { logger } = require('../../logger');
const { Role } = require('../models/role');
const { User } = require('../models/user');
const fs = require('fs');

const permissionPath = './src/permissions/';

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

let allPermissions = [...base];
const initializeAsync = async (pathOfPermissions) => {
    const fileNames = await readPermissionFilesAsync(pathOfPermissions);
    const files = await fileNames.map(f => getFileAsync(pathOfPermissions, f));
    return new Promise((resolve, reject) => {
        try {
            files.forEach(function (file) {
                var json_array = JSON.parse(file);
                json_array.forEach((permission) => {
                    allPermissions.push(permission)
                });
            });
            return resolve(allPermissions);
        } catch (error) {
            reject(error)
        }
    })


    // await readPermissionFilesAsync(pathOfPermissions)
    //     .then((fileNames) => {
    //         return Promise.all(fileNames.map((f => getFile(pathOfPermissions, f))));
    //     })
    //     .then((files) => {
    //         files.forEach(function (file) {
    //             var json_array = JSON.parse(file);
    //             json_array.forEach((permission) => {
    //                 allPermissions.push(permission)
    //             });
    //         })
    //         return permissionManager;
    //     });
}
const initialize = (pathOfPermissions) => {
    const fileNames = readPermissionFiles(pathOfPermissions);
    const files = fileNames.map(f => getFile(pathOfPermissions, f));
    files.forEach(function (file) {
        var json_array = JSON.parse(file);
        json_array.forEach((permission) => {
            allPermissions.push(permission)
        });
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
const permissionManager = {
    initialize: initialize,
    GetAllPermissions: () => {
        return allPermissions;
    },
    AddPermissionsToRole: addPermissionToRole,
    GetUserPermissions: getUserPermissions
}

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
const readPermissionFiles = (dirname) => {
    return fs.readdirSync(dirname).filter(t => t.endsWith('.json'));
}
const getFileAsync = (path, filename) => {
    return readFileAsync(path + filename, 'utf8');
}
const getFile = (path, filename) => {
    return readFile(path + filename, 'utf8');
}
const readFile = (filename, enc) => {
    return fs.readFileSync(filename, enc);
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
permissionManager.initialize(permissionPath);
console.log("Initialized permission manager...");
module.exports = { permissionManager };