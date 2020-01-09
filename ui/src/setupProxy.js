const proxy = require('http-proxy-middleware');
module.exports = function(app) {
  app.use(
    '/graphql',
    proxy({
      target: 'http://localhost:4000',
      changeOrigin: true,
    })
  );
  app.use(
    '/introspectionFragmentMatcher',
    proxy({
      target: 'http://localhost:4000',
      changeOrigin: true,
    })
  );
};