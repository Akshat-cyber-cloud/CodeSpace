import axios from 'axios';

async function run() {
    try {
        console.log("Sending request to local AI Orchestration server...");
        const response = await axios.post('http://localhost:3000/api/ai/invoke', {
            projectId: "019e5b5c-af54-7539-adb1-662319100b5a",
            message: "Complete the implementation of the Snake Game. The file `src/components/SnakeGame.jsx` is missing from the workspace, which is causing a Vite import-analysis error. Create and write the complete, polished, stateful `src/components/SnakeGame.jsx` component that links the `GameBoard`, `ScoreBoard`, and `Controls` components together."
        }, {
            responseType: 'stream'
        });

        response.data.on('data', chunk => {
            process.stdout.write(chunk.toString());
        });

        response.data.on('end', () => {
            console.log("\nStream finished!");
            process.exit(0);
        });
    } catch (err) {
        console.error("Error invoking:", err.message);
        process.exit(1);
    }
}

run();
