const express = require("express");
const path = require('path')
const proxy = require('http-proxy-middleware');
const serveStatic = require('serve-static');

const PORT = process.env.PORT || 3000;

const app = new express();

app.use(serveStatic('../ui/build',{
  index:["index.html"]
}));

app.use('^/graphql',proxy({
  target: 'http://localhost:4000',
  ws: true
}));


const server = app.listen(PORT);

console.log(`listening on port ${PORT}`);