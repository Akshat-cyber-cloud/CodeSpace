import app, { getProxy, getAgentProxy } from './src/app.js';

const server = app.listen(3000, () => {
  console.log('Sandbox Router is running on port 3000');
});

server.on('upgrade', (req, socket, head) => {
  const host = req.headers.host;
  if (!host) {
    socket.destroy();
    return;
  }
  const parts = host.split('.');
  const sandboxId = parts[0];
  const domainType = parts[1];

  if (domainType === 'agent') {
    const proxy = getAgentProxy(sandboxId);
    if (proxy && typeof proxy.upgrade === 'function') {
      proxy.upgrade(req, socket, head);
    }
  } else if (domainType === 'preview') {
    const proxy = getProxy(sandboxId);
    if (proxy && typeof proxy.upgrade === 'function') {
      proxy.upgrade(req, socket, head);
    }
  }
});