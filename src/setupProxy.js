const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api-token-auth',
    createProxyMiddleware({
      target: 'http://q.softo.live:85/api-token-auth/',
      changeOrigin: true,
    })
  );

  app.use(
    '/iclock/api/transactions',
    createProxyMiddleware({
      target: 'http://q.softo.live:85/iclock/api/transactions/',
      changeOrigin: true,
    })
  );


  app.use(
  '/jsonrpc',
  createProxyMiddleware({
    target: 'https://odoo.q-mart.net/jsonrpc',
    changeOrigin: true,
  })
);

};
