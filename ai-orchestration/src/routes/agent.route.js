import { Router } from "express";
import agent from "../agents/code.agent.js";

const agentRouter = Router();

agentRouter.post("/invoke", async (req, res) => {
    const { message, projectId } = req.body;

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
    });

    const sendSSE = (data, eventType = "message") => {
        let payload = typeof data === 'string' ? data : JSON.stringify(data);
        payload = payload.trim(); // MUST trim leading/trailing newlines to prevent empty data: rows
        if (!payload) return;

        let out = `event: ${eventType}\n`;
        const lines = payload.split('\n');
        for (const line of lines) {
            out += `data: ${line}\n`;
        }
        out += `\n`; // single newline to terminate
        res.write(out);
    };

    // Send heartbeat every 5 seconds to prevent idle/timeout disconnects
    const heartbeat = setInterval(()  => {
        res.write(': heartbeat\n\n');
    }, 5000);

    // Clean up if the client closes the connection early
    req.on('close', () => {
        clearInterval(heartbeat);
    });

    const writer = (text) => sendSSE(text, "tool");

    const tracker = {
        filesRead: new Set(),
        filesUpdated: new Set(),
        filesListed: false,
        writer
    };

    try {
        const stream = await agent.stream(
            { messages: [ { role: "user", content: message } ] },
            {
                context: { projectId, tracker },
                streamMode: "values"
            }
        );

        let lastState = null;
        for await (const state of stream) {
            lastState = state;
        }

        if (lastState?.messages?.length) {
            const msgs = lastState.messages;
            for (let i = msgs.length - 1; i >= 0; i--) {
                const m = msgs[i];
                const role = m.role ?? m._getType?.();
                if ((role === 'ai' || role === 'assistant') && !m.tool_calls?.length) {
                    const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
                    sendSSE(`🤖 Agent Response:\n${content}`, "answer");
                    break;
                }
            }
        }

        // Write a beautiful consolidated summary of files worked on
        let summary = `==================================================\n`;
        summary += `⚙️  WORKFLOW EXECUTION SUMMARY\n`;
        summary += `==================================================\n\n`;
        
        summary += `📂 FILES LISTED:\n`;
        if (tracker.filesListed) {
            summary += `   ▪ Workspace files indexed successfully.\n`;
        } else {
            summary += `   ▪ None\n`;
        }
        summary += `\n`;

        summary += `🔍 FILES READ & ANALYZED:\n`;
        if (tracker.filesRead.size > 0) {
            Array.from(tracker.filesRead).forEach(f => {
                summary += `   ▪ ${f}\n`;
            });
        } else {
            summary += `   ▪ None\n`;
        }
        summary += `\n`;

        summary += `📝 FILES CREATED / UPDATED:\n`;
        if (tracker.filesUpdated.size > 0) {
            Array.from(tracker.filesUpdated).forEach(f => {
                summary += `   ▪ ${f}\n`;
            });
        } else {
            summary += `   ▪ None\n`;
        }
        summary += `==================================================`;

        sendSSE(summary, "summary");

        clearInterval(heartbeat);
        res.end();
    } catch (error) {
        clearInterval(heartbeat);
        console.error("Error invoking agent:", error);
        if (res.headersSent) {
            sendSSE(`Error during agent execution: ${error.message || String(error)}`, "error");
            res.end();
        } else {
            res.status(500).json({ error: "Failed to invoke agent" });
        }
    }
});

export default agentRouter;