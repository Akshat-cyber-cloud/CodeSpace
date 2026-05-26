import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { listFiles } from "./agents/tools.js";

async function test() {
    try {
        console.log("Initializing ChatMistralAI model...");
        const model = new ChatMistralAI({
            model: "mistral-large-latest",
            apiKey: process.env.MISTRALAI_API_KEY,
            temperature: 0.0, // set temperature to 0 for deterministic tool calling
            timeout: 120000
        });

        console.log("Binding list_files tool to model...");
        const modelWithTools = model.bind({
            tools: [
                {
                    type: "function",
                    function: {
                        name: "list_files",
                        description: "List all files in project directory."
                    }
                }
            ]
        });

        console.log("Invoking model...");
        const res = await modelWithTools.invoke("List the files in the workspace.");
        console.log("Response tool calls:", res.tool_calls);
    } catch (err) {
        console.error("Tool calling test failed:", err);
    }
}

test();
