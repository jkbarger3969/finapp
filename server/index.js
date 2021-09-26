const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");
const serveStatic = require("serve-static");

const PORT = process.env.PORT || 3000;

const app = new express();

app.use(
  "^/graphql",
  createProxyMiddleware({
    target: "http://localhost:4000",
  })
);

app.use(
  serveStatic(path.join(__dirname, "../ui/dist"), {
    index: ["index.html"],
  })
);

app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "../ui/dist/index.html"));
});

const server = app.listen(PORT);

console.log(`listening on port ${PORT}`);
