import app, { getProxy, getAgentProxy } from './src/app.js';

const server = app.listen(3000, () => {
  console.log('Sandbox Router is running on port 3000');
});

function parseFromPreviewUrl(urlStr) {
  if (!urlStr) return null;
  try {
    if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
      urlStr = 'http://' + urlStr;
    }
    const parsed = new URL(urlStr);
    const host = parsed.hostname;
    const parts = host.split('.');
    if (parts.length >= 3) {
      return {
        sandboxId: parts[0],
        domainType: parts[1]
      };
    }
  } catch (e) {
    console.error('Failed to parse previewUrl:', e);
  }
  return null;
}

server.on('upgrade', (req, socket, head) => {
  const host = req.headers.host || '';
  console.log('[Router] UPGRADE request for host:', host, 'url:', req.url);

  let sandboxId;
  let domainType;

  try {
    const urlObj = new URL(req.url, `http://${host || 'localhost'}`);
    sandboxId = urlObj.searchParams.get('sandboxId') || req.headers['sandboxid'] || req.headers['x-sandbox-id'] || req.headers['sandbox-id'];
    domainType = urlObj.searchParams.get('domainType') || req.headers['domaintype'] || req.headers['x-domain-type'] || req.headers['domain-type'];

    const previewUrlParam = urlObj.searchParams.get('previewUrl') || req.headers['previewurl'] || req.headers['preview-url'];
    if (previewUrlParam) {
      const parsed = parseFromPreviewUrl(previewUrlParam);
      if (parsed) {
        sandboxId = parsed.sandboxId;
        domainType = parsed.domainType;
      }
    }
  } catch (e) {
    console.error('[Router] Error parsing URL for upgrade:', e);
  }

  const isIP = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host.split(':')[0]);

  if ((!sandboxId || !domainType) && !isIP) {
    const parts = host.split('.');
    if (parts.length >= 3) {
      sandboxId = parts[0];
      domainType = parts[1];
    }
  }

  if (req.url.startsWith('/socket.io')) {
    domainType = 'agent';
  }

  if (domainType === 'agent' && sandboxId) {
    const proxy = getAgentProxy(sandboxId);
    console.log('[Router] Proxying WebSocket upgrade to agent');
    proxy.upgrade(req, socket, head);
  } else if (domainType === 'preview' && sandboxId) {
    const proxy = getProxy(sandboxId);
    console.log('[Router] Proxying WebSocket upgrade to preview');
    proxy.upgrade(req, socket, head);
  } else {
    console.log('[Router] UPGRADE request ignored - missing sandboxId or domainType. host:', host, 'sandboxId:', sandboxId, 'domainType:', domainType);
    socket.destroy();
  }
});