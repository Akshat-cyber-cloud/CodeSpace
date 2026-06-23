import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { Server } from 'socket.io';
import http from 'http';
import pty from "node-pty";
import os from 'os';


const WORKING_DIR = '/workspace';
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    }
});

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).json({
        message: "Hello from another agent API",
        status: "success",
    });
});

const shell = process.env.SHELL || 'bash';

const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: "/workspace",
    env: process.env,
});

ptyProcess.onData((data) => {
    io.emit('terminal:data', data);
})

ptyProcess.onExit((code) => {
    io.emit('terminal:exit', code);
});

io.on("connection", (socket) => {
    console.log("new user connected", socket.id);

    socket.on("terminal-input", (data) => {
        ptyProcess.write(data);
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

app.get("/list-files", async (req, res) => {

    const listFiles = async (dir, baseDir) => {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        const files = [];

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(baseDir, fullPath);

            // Exclude certain directories
            if (entry.isDirectory() && ['node_modules', '.git', 'dist'].includes(entry.name)) {
                continue;
            }

            if (entry.isDirectory()) {
                files.push(...await listFiles(fullPath, baseDir));
            } else {
                files.push(relativePath);
            }
        }

        return files;
    }

    try {
        const files = await listFiles(WORKING_DIR, WORKING_DIR);
        res.status(200).json({
            message: 'Files listed successfully',
            files,
        });
    } catch (err) {
        res.status(500).json({
            message: `Error listing files: ${err.message}`,
            status: 'error',
        });
    }

});

app.get('/read-files', async (req, res) => {
    const files = req.query.files;

    if (!files) {
        return res.status(400).json({
            message: "No files specified",
            status: "error"
        });
    }

    const fileList = files.split(',');

    const results = await Promise.all(fileList.map(async (file) => {
        let cleanFile = file.startsWith('/') ? file.slice(1) : file;
        if (cleanFile.startsWith('workspace/')) {
            cleanFile = cleanFile.slice(10);
        }
        const filePath = `${WORKING_DIR}/${cleanFile}`;

        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            return {
                [cleanFile]: content
            }
        } catch (err) {
            console.error(`Error reading file ${file}:`, err);
            return {
                [cleanFile]: `Error: ${err.message}`
            }
        }
    }));

    res.status(200).json({
        message: "Files read results",
        results: results
    });
});

app.patch('/update-files', async (req, res) => {
    const updates = req.body.updates;

    if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({
            message: "Invalid updates format",
            status: "error"
        });
    }

    const results = await Promise.all(updates.map(async (update) => {
        const { file, content } = update;
        let cleanFile = file.startsWith('/') ? file.slice(1) : file;
        if (cleanFile.startsWith('workspace/')) {
            cleanFile = cleanFile.slice(10);
        }
        const filePath = `${WORKING_DIR}/${cleanFile}`;
        try {
            await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
            await fs.promises.writeFile(filePath, content, 'utf-8');
            return {
                [cleanFile]: content
            }
        } catch (err) {
            console.error(`Error updating file ${file}:`, err);
            return {
                [cleanFile]: `Error: ${err.message}`
            }
        }

    }));

    res.status(200).json({
        message: "File update results",
        results: results
    });
});

app.post('/create-file', async (req, res) => {

    const files = req.body.files;

    if (!files || !Array.isArray(files)) {
        return res.status(400).json({
            message: "Invalid files format",
            status: "error"
        });
    }

    const results = await Promise.all(files.map(async (file) => {
        const filename = file.file || file.name;
        if (!filename) {
            return {
                "error": "Filename is missing"
            };
        }

        let cleanFile = filename.startsWith('/') ? filename.slice(1) : filename;
        if (cleanFile.startsWith('workspace/')) {
            cleanFile = cleanFile.slice(10);
        }
        const filePath = `${WORKING_DIR}/${cleanFile}`;

        try {
            const isDir = cleanFile.endsWith('/') || file.isDir || file.isFolder || file.isDirectory;

            if (isDir) {
                await fs.promises.mkdir(filePath, { recursive: true });
                return {
                    [cleanFile]: "directory created successfully"
                };
            } else {
                await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
                await fs.promises.writeFile(filePath, file.content || '', 'utf-8');
                return {
                    [cleanFile]: "created successfully"
                };
            }
        } catch (err) {
            console.error(`Error creating file/directory ${filename}:`, err);
            return {
                [cleanFile]: `Error: ${err.message}`
            }
        }
    }));

    res.status(201).json({
        message: "File creation results",
        results: results
    });
});



export default httpServer;