var crypto = require('crypto');
var async = require('async');
var util = require('util');

var mongoose = require('../lib/mongoose'),
  Schema = mongoose.Schema;

var schema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: Array,
    default: []
  }
});

schema.methods.encryptPassword = function(password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.virtual('password')
  .set(function(password) {
    this._plainPassword = password;
    this.salt = Math.random() + '';
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() { return this._plainPassword; });


schema.methods.checkPassword = function(password) {
  return this.encryptPassword(password) === this.hashedPassword;
};

schema.statics.addNote = function(userId, text, res) {
  this.findOne({_id: userId}, function (err, user) {
    if (err) {
      throw err;
    }
    user.notes.push(text);
    user.save(function (err) {
      if (err) {
        throw err;
      }
      res.redirect('/notes');
    });
  });
};

schema.statics.changeNote = function(userId, action, text, num, res) {
  this.findOne({_id: userId}, function (err, user) {
    if (err) {
      throw err;
    }
    if (action === 'Изменить') {
      user.notes.splice(num, 1, text);
    } else if (action === 'Удалить') {
      user.notes.splice(num, 1);
    }
    user.save(function (err) {
      if (err) {
        throw err;
      }
      res.redirect('/notes');
    });
  });
};

schema.statics.authorize = function(username, password, callback) {
  var User = this;

  async.waterfall([
    function(callback) {
      User.findOne({username: username}, callback);
    },
    function(user, callback) {
      if (user) {
        if (user.checkPassword(password)) {
          callback(null, user);
        } else {
          callback(new AuthError("Пароль неверен"));
        }
      } else {
        const user = new User({username: username, password: password});
        user.save(function(err) {
          if (err) return callback(err);
          callback(null, user);
        });
      }
    }
  ], callback);
};

exports.User = mongoose.model('User', schema);


function AuthError(message) {
  Error.apply(this, arguments);
  Error.captureStackTrace(this, AuthError);

  this.message = message;
}

util.inherits(AuthError, Error);

AuthError.prototype.name = 'AuthError';

exports.AuthError = AuthError;
