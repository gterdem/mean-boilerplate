const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const permissionSchema = new Schema({
    level: String,
    parentName: String,
    name: {
        type: String,
        required: [true],
        unique: true
    },
    displayName: String,
    description: String
});

const roleSchema = new Schema({
    name: {
        type: String,
        required: [true],
        unique: true
    },
    permissions: [permissionSchema]
});

module.exports = { roleSchema };