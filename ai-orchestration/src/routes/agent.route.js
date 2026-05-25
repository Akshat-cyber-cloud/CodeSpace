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

    // Send heartbeat every 5 seconds to prevent idle/timeout disconnects
    const heartbeat = setInterval(() => {
        res.write(': heartbeat\n\n');
    }, 5000);

    // Clean up if the client closes the connection early
    req.on('close', () => {
        clearInterval(heartbeat);
    });

    const writer = (text) => res.write(text);

    try {
        const stream = await agent.stream(
            { messages: [ { role: "user", content: message } ] },
            {
                context: { projectId, writer },
                streamMode: "values",
                timeout: 120000,
                callbacks: [
                    {
                        handleLLMNewToken(token) {
                            // Only stream the token if it's not empty
                            if (token) {
                                writer(token);
                            }
                        }
                    }
                ]
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
                    res.write(content + '\n');
                    break;
                }
            }
        }

        clearInterval(heartbeat);
        res.end();
    } catch (error) {
        clearInterval(heartbeat);
        console.error("Error invoking agent:", error);
        if (res.headersSent) {
            res.write(`\nError during agent execution: ${error.message || error}\n`);
            res.end();
        } else {
            res.status(500).json({ error: "Failed to invoke agent" });
        }
    }
});

export default agentRouter;