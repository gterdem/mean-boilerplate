const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const { userSchema } = require('./schema');

userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
});

const User = mongoose.model('User', userSchema);
module.exports = { User };