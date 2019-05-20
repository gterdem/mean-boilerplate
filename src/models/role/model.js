const mongoose = require('mongoose');
const { roleSchema } = require('./schema');
const { fieldToSearch } = require('../../utils/mongo');

roleSchema.methods.fieldsToSearch = search => [
    'model'
].map(fieldToSearch(search));

const Role = mongoose.model('Role', roleSchema);
module.exports = { Role };