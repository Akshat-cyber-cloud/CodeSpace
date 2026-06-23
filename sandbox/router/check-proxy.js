import { createProxyMiddleware } from 'http-proxy-middleware';
const proxy = createProxyMiddleware({ target: 'http://localhost' });
console.log('typeof proxy.upgrade:', typeof proxy.upgrade);
