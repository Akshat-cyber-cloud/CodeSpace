import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage } from "@langchain/core/messages";

async function test() {
    try {
        console.log("Initializing model with key:", process.env.MISTRALAI_API_KEY ? "EXISTS" : "MISSING");
        const model = new ChatMistralAI({
            model: "mistral-large-latest",
            apiKey: process.env.MISTRALAI_API_KEY,
            temperature: 0.7,
            timeout: 120000,
            streaming: false
        });

        console.log("Sending query to Mistral...");
        const start = Date.now();
        const res = await model.invoke([new HumanMessage("Hello, what is your model name?")]);
        console.log(`Response received in ${((Date.now() - start)/1000).toFixed(2)}s:`);
        console.log(res.content);
    } catch (err) {
        console.error("Mistral test failed:", err);
    }
}

test();
