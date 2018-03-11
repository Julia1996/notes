var checkAuth = require('../middleware/checkAuth');

module.exports = function(app) {

  app.get('/', require('./frontpage').get);

  app.get('/login', require('./login').get);
  app.post('/login', require('./login').post);

  app.get('/logout', require('./logout').get);

  app.get('/notes', checkAuth, require('./notes').get);
  app.post('/notes', checkAuth, require('./notes').post);

  app.post('/change-note', checkAuth, require('./change-note').post);
};
