const _ = require('lodash');
const fs = require('fs');
const { logger } = require('../../logger');
const { Role } = require('../models/role');
const { User } = require('../models/user');
const NodeCache = require("node-cache");
const { APIError } = require('rest-api-errors');
const userInfoCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

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
const addPermissionToRoleAsync = async (roleId, permissionList) => {
    try {
        const role = await Role.findOne({ roleId });
        role.permissions = permissionList;
        role.save(done);
    } catch (error) {
        logger.error('Error when adding permissions to role', { metadata: error });
        next(error);
    }
}
const getUserPermissionsByIdAsync = async (userId) => {
    const user = await User.findOne({ _id: userId })
        .populate('roles')
        .populate('roles.permissions')
        .exec();
    let mergedPermissions = [];
    user.roles.forEach(role => {
        // mergedPermissions = _.union(mergedPermissions, role.permissions.map(f => f.toJSON())); 
        const filterdRoleList = role.permissions.reduce((filtered, option) => {
            filtered.push(option.name)
            return filtered;
        }, []);
        mergedPermissions = _.union(mergedPermissions, filterdRoleList);
    });
    return mergedPermissions;
}
const getPermissionByName = (permissionName) => {
    return allPermissions.filter(f => f.name === permissionName);
}
const authorizeAsync = async (userId, requiredPermissions) => {
    const permissions = normalizePermissionNames(requiredPermissions);
    const missingPermissions = await getMissingPermissionsAsync(userId, permissions);
    return new Promise((resolve, reject) => {
        if (missingPermissions.length === 0) {
            resolve(true);
        } else {
            reject(new APIError(403, "Missing Permission", `You need at least one of these permissions: ${missingPermissions}`));
        }
    });
}
const createUserInfoCache = async (userId) => {
    const existingCacheData = userInfoCache.get(userId.toString());
    if (existingCacheData != undefined) {
        userInfoCache.del(userId.toString());
    }
    const userPermissions = await getUserPermissionsByIdAsync(userId);
    userInfoCache.set(userId.toString(), userPermissions);
}

const permissionManager = {
    initializeAsync: initializeAsync,
    AuthorizeAsync: authorizeAsync,
    AddPermissionsToRole: addPermissionToRoleAsync,
    CreateUserInfoCache: createUserInfoCache,
    GetAllPermissions: () => { return allPermissions; },
    GetUserPermissionsByIdAsync: getUserPermissionsByIdAsync,
    GetPermissionByName: getPermissionByName
}

module.exports = { permissionManager, userInfoCache };

/** Helper methods */
const readPermissionFilesAsync = (dirname) => {
    return new Promise((resolve, reject) => {
        fs.readdir(dirname, (err, filenames) => {
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
const normalizePermissionNames = (requiredPermissionsObject) => {
    let requiredPermissionList = []
    for (var key in requiredPermissionsObject) {
        if (requiredPermissionsObject.hasOwnProperty(key)) {
            requiredPermissionList.push(requiredPermissionsObject[key]);
        }
    }
    return requiredPermissionList;
}

const getMissingPermissionsAsync = async (userId, requiredPermissions) => {
    let existingUserPermissions = userInfoCache.get(userId.toString());
    let missingPermissions = [];
    if (existingUserPermissions == undefined) {
        console.log(`getMissingPermissionsAsync couldn't found cache data! Getting from db and setting back to cache...`);
        existingUserPermissions = await getUserPermissionsByIdAsync(userId);
        userInfoCache.set(userId.toString(), existingUserPermissions);
    }
    for (var i = 0; i < requiredPermissions.length; i++) {
        if (existingUserPermissions.indexOf(requiredPermissions[i]) === -1)
            missingPermissions.push(requiredPermissions[i]);
    }
    return missingPermissions;
}