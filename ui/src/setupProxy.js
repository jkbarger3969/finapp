const proxy = require('http-proxy-middleware');
module.exports = function(app) {
  // app.use(
  //   '/graphql',
  //   proxy({
  //     target: 'http://localhost:4000',
  //   })
  // );
  app.use(
    '^/graphql',
    proxy({
      target: 'http://localhost:4000',
      ws: true
    })
  );
};