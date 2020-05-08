const { createProxyMiddleware } = require("http-proxy-middleware");
module.exports = function(app) {
  // app.use(
  //   '/graphql',
  //   proxy({
  //     target: 'http://localhost:4000',
  //   })
  // );
  app.use(
    "/graphql",
    createProxyMiddleware({
      target: "http://localhost:4000",
      changeOrigin: true,
      ws: true,
    })
  );
};
