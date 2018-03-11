const User = require('../models/user').User;

exports.get = function(req, res) {
  res.render('notes');
};

exports.post = function(req, res) {
  const text = req.body.text;
  const userId =  req.session.user;

  User.addNote(userId, text, res);
}