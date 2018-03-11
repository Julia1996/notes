const User = require('../models/user').User;

exports.post = function(req, res) {
  const text = req.body.text;
  const action =  req.body.act;
  const num =  req.body.num;
  const userId =  req.session.user;

  User.changeNote(userId, action, text, +num, res);
}