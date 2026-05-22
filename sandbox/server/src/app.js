import express from 'express';
import morgan from 'morgan';
import { createPod } from './kubernestes/pod.js';
import { createService } from './kubernestes/service.js';
import { v7 as uuid } from 'uuid';
const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

export default app;