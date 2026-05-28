import express from 'express';
import morgan from 'morgan';
import { createPod, deletePod } from './kubernestes/pod.js';
import { createService, deleteService } from './kubernestes/service.js';
import { k8sCoreV1Api } from './kubernestes/config.js';
import { v7 as uuid } from 'uuid';
const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lightweight Zero-Dependency CORS Middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, sandboxid, domaintype, previewurl');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.get('/api/sandbox/health', (req, res) => {
    res.status(200).json({
        message: "Sandbox API is healthy",
        status: 'ok'
    });
});

app.post('/api/sandbox/start', async (req, res) => {
    const sandboxId = uuid();

    await Promise.all([
        createPod(sandboxId),
        createService(sandboxId)
    ]);

    res.status(201).json({
        message: "Sandbox created successfully",
        sandboxId: sandboxId,
        previewUrl: `http://${sandboxId}.preview.localhost`
    });
});

// Global memory for tracking activity
const sandboxActivityMap = new Map();

app.post('/api/sandbox/activity', (req, res) => {
    const activity = req.body.activity;
    if (activity) {
        for (const [sandboxId, timestamp] of Object.entries(activity)) {
            sandboxActivityMap.set(sandboxId, timestamp);
        }
    }
    res.status(200).json({ status: 'received' });
});

// Background cleanup cron job (runs every 10 minutes)
setInterval(async () => {
    console.log('[Cleanup Job] Checking for inactive sandbox pods...');
    try {
        let pods = [];
        try {
            const response = await k8sCoreV1Api.listNamespacedPod({ namespace: 'default', labelSelector: 'app=sandbox' });
            pods = response.items || (response.body && response.body.items) || [];
        } catch (e) {
            const response = await k8sCoreV1Api.listNamespacedPod('default', undefined, undefined, undefined, undefined, 'app=sandbox');
            pods = response.items || (response.body && response.body.items) || [];
        }
        
        const now = Date.now();
        const INACTIVE_THRESHOLD = 60 * 60 * 1000; // 1 hour
        
        for (const pod of pods) {
            const sandboxId = pod.metadata.labels.sandboxId;
            if (!sandboxId) continue;
            
            const creationTime = new Date(pod.metadata.creationTimestamp).getTime();
            const lastActiveTime = sandboxActivityMap.get(sandboxId) || creationTime;
            
            if (now - lastActiveTime > INACTIVE_THRESHOLD && now - creationTime > INACTIVE_THRESHOLD) {
                console.log(`[Cleanup Job] Sandbox ${sandboxId} has been inactive for >1hr. Deleting...`);
                try {
                    await deleteService(sandboxId);
                    await deletePod(sandboxId);
                    sandboxActivityMap.delete(sandboxId);
                } catch (err) {
                    console.error(`[Cleanup Job] Failed to delete ${sandboxId}:`, err.message);
                }
            }
        }
    } catch (err) {
        console.error('[Cleanup Job] Failed to list pods:', err.message);
    }
}, 10 * 60 * 1000);

export default app;