const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { Role } = require('../role');
const { EMAIL } = require('../../utils/regexes');

const userSchema = new Schema({
  email: {
    type: String,
    required: [true],
    unique: true,
    validate: {
      validator: email => EMAIL.test(email),
      message: 'Field [email] wrong format.',
    },
  },
  profile: {
    name: {
      type: String,
      required: [false],
    },
    lastName: {
      type: String,
      required: [false]
    },
    avatar: {
      type: String,
    }
  },
  roles: [{
    type: Schema.Types.ObjectId,
    ref: Role
  }]
});

module.exports = { userSchema };