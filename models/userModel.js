const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false, // never show up in client response
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A user must have a password confirmation'],
    validate: {
      // This only works on SAVE or CREATE!!! Doesn't work on UPDATE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false, // never show up in client response
  },
});

userSchema.pre('save', async function (next) {
  // if the password hasn't changed, don't run this code
  if (!this.isModified('password')) return next();
  // otherwise:

  // 12 is the hash cost || a measurement of how CPU intensive to hash the password
  this.password = await bcrypt.hash(this.password, 12);

  // passwordConfirm is no longer needed, just for validation purposes
  // it's a required input, but not required to be persisted in the database
  this.passwordConfirm = undefined;
  next();
});

// everytime if we don't modify the password, go next middleware
// but when we create a new document, we do modify the password
// so we create a PasswordChangeAt property
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  // sometimes saving the timestamp can have bit delay after the JSON Web Token has been created
  // so we -1 sec of the timestamp to ensure that this property is always been created
  // before the JWT is issued
  next();
});

// query middleware: don't display user who is inactive for every query starts with find
userSchema.pre(/^'find'/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// this is a costomized instance method of the document schema
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  // because password is hidden from the response, we cannot use this.password to access it directly
  return await bcrypt.compare(candidatePassword, userPassword); // returns true or false
};

// remeber this in schema always points to the document, so we have the access to the property
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  // Most of users don't have this property, so we only need to check the one that has it
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp; // 100 < 200: will be true if user changed password after JWT was issued
  }

  // if the password does not change
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
