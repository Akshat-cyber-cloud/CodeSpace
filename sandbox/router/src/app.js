import express from 'express';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.use(morgan('combined'));

app.get('/api/status/healthz', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.get('/api/status/readyz', (req, res) => {
    res.status(200).json({ status: 'ready' });
});

/**
 * pod1.preview.localhost 
 * pod1.agent.localhost
 */

const proxies = {};
const agentProxies = {};

const sandboxActivity = new Map();

// Periodically report activity to the sandbox server
setInterval(async () => {
    if (sandboxActivity.size === 0) return;
    
    const activityData = Object.fromEntries(sandboxActivity);
    sandboxActivity.clear(); // Clear so we only send fresh activity

    try {
        await fetch('http://sandbox-service:80/api/sandbox/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activity: activityData })
        });
    } catch (err) {
        console.error('Failed to report activity to sandbox server:', err.message);
    }
}, 60 * 1000);

export function getProxy(sandboxId) {
    if(!proxies[sandboxId]) {
        proxies[sandboxId] = createProxyMiddleware({
            target: `http://sandbox-service-${sandboxId}`,
            changeOrigin: true,
            ws: true,
        });
    }
    return proxies[sandboxId];
}

export function getAgentProxy(sandboxId) {

    if(!agentProxies[sandboxId]) {
        agentProxies[sandboxId] = createProxyMiddleware({
            target: `http://sandbox-service-${sandboxId}:3000`,
            changeOrigin: true,
            ws: true,
        }); 
    }
    return agentProxies[sandboxId];
}

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

app.use((req, res, next) => {
    const host = req.headers.host || '';
    
    let sandboxId = req.query.sandboxId || req.headers['sandboxid'] || req.headers['x-sandbox-id'] || req.headers['sandbox-id'];
    let domainType = req.query.domainType || req.headers['domaintype'] || req.headers['x-domain-type'] || req.headers['domain-type'];

    const previewUrlParam = req.query.previewUrl || req.headers['previewurl'] || req.headers['preview-url'];
    if (previewUrlParam) {
        const parsed = parseFromPreviewUrl(previewUrlParam);
        if (parsed) {
            sandboxId = parsed.sandboxId;
            domainType = parsed.domainType;
        }
    }

    const isIP = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host.split(':')[0]);

    if ((!sandboxId || !domainType) && !isIP) {
        const parts = host.split('.');
        if (parts.length >= 3) {
            sandboxId = parts[0];
            domainType = parts[1];
        }
    }

    if (req.path.startsWith('/socket.io')) {
        domainType = 'agent';
    }

    if (domainType === 'agent' && sandboxId) {
        sandboxActivity.set(sandboxId, Date.now());
        return getAgentProxy(sandboxId)(req, res, next);
    } else if (domainType === 'preview' && sandboxId) {
        sandboxActivity.set(sandboxId, Date.now());
        return getProxy(sandboxId)(req, res, next);
    }

    next();
});

export default app