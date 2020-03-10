const { createProxyMiddleware } = require("http-proxy-middleware");

console.log("Setting up a Proxy to localhost:8000");
module.exports = function(app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:8000/chiveproxy",
      changeOrigin: true
    })
  );
};
