import axios from 'axios';

async function run() {
    try {
        console.log("Sending request to local AI Orchestration server...");
        const response = await axios.post('http://127.0.0.1/api/ai/invoke', {
            projectId: "019e62e9-e88b-778c-95e6-dc514a72fd8d",
            message: "Verify the files in the workspace. Then, create a brand new file `/workspace/src/components/MyNewVerificationComponent.jsx` that exports a simple, beautiful React component displaying 'Tracking Verified!'. Finally, list the files to verify it was successfully created."
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
