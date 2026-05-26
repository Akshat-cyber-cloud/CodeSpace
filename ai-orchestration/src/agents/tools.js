import axios from 'axios';
import { tool } from "langchain"
import * as z from "zod";

const getSandboxUrl = (projectId) => {
    const template = process.env.SANDBOX_SERVICE_URL_TEMPLATE || 'http://sandbox-service-${projectId}:3000';
    return template.replace('${projectId}', projectId);
};

const sendRequest = async (method, projectId, path, payload = null) => {
    const rawUrl = getSandboxUrl(projectId);
    const parsedUrl = new URL(path, rawUrl);
    
    const config = {
        method,
        url: parsedUrl.toString(),
        headers: {}
    };

    if (payload) {
        config.data = payload;
    }

    // Check if the URL hostname ends with .localhost and isn't just 'localhost'
    if (parsedUrl.hostname.endsWith('.localhost') && parsedUrl.hostname !== 'localhost') {
        const hostHeader = parsedUrl.host; // e.g., "019e5b5c-af54-7539-adb1-662319100b5a.agent.localhost"
        config.headers['Host'] = hostHeader;
        
        // Rewrite the URL to point to the router-service on port 80 (internal k8s routing)
        parsedUrl.hostname = 'router-service';
        parsedUrl.port = ''; // default port 80
        config.url = parsedUrl.toString();
    }

    return axios(config);
};

export const listFiles = tool(
    async ({ }, config) => {
        const tracker = config.context?.tracker;
        const writer = tracker?.writer ?? config.context?.writer ?? (() => {});

        if (tracker) {
            tracker.filesListed = true;
            writer(`\n[System] 📂 Indexing workspace files...\n`);
        } else {
            writer("Listing files in project directory...\n");
        }

        const response = await sendRequest('GET', config.context.projectId, '/list-files');

        if (!tracker) {
            writer("Files listed successfully." + "Files: " + response.data.files.join(",") + "\n");
        }
        return JSON.stringify(response.data.files);
    },
    {
        name: "list_files",
        description: "List all the files in the project directory. This is useful for understanding what files are available to work with.",
        schema: z.object({})
    }
)

export const readFiles = tool(
    async ({ files = [] }, config) => {
        const tracker = config.context?.tracker;
        const writer = tracker?.writer ?? config.context?.writer ?? (() => {});

        if (tracker) {
            files.forEach(f => tracker.filesRead.add(f.replace('/workspace/', '')));
            writer(`\n[System] 🔍 Examining files:\n${files.map(f => `   ▪ ${f.replace('/workspace/', '')}`).join('\n')}\n`);
        } else {
            writer("Reading files..." + files.join(",") + "\n");
        }

        const response = await sendRequest('GET', config.context.projectId, '/read-files?files=' + files.join(","));

        if (!tracker) {
            writer("Files read successfully.\n");
        }
        return JSON.stringify(response.data);
    },
    {
        name: "read_files",
        description: "Read the contents of specified files. This is useful for understanding the content of files that are relevant to the task at hand.",
        schema: z.object({
            files: z.array(z.string()).describe("The list of files absolute paths to read. These should be files that were listed using the list_files tool or created later")
        })
    }
)

export const updateFiles = tool(
    async ({ files }, config) => {
        console.log("updateFiles CALLED! files:", files.map(f => f.file), "config:", Object.keys(config), "context:", config.context);
        const tracker = config.context?.tracker;
        const writer = tracker?.writer ?? config.context?.writer ?? (() => {});

        if (tracker) {
            files.forEach(f => tracker.filesUpdated.add(f.file.replace('/workspace/', '')));
            writer(`\n[System] 📝 Modifying files:\n${files.map(f => `   ▪ ${f.file.replace('/workspace/', '')}`).join('\n')}\n`);
        } else {
            writer("Updating files..." + files.map(f => f.file).join(",") + "\n");
        }

        const response = await sendRequest('PATCH', config.context.projectId, '/update-files', {
            updates: files
        });

        if (!tracker) {
            writer("Files updated successfully.\n");
        }
        return JSON.stringify(response.data.results);
    },
    {
        name: "update_files",
        description: "Update the contents of specified files. This is useful for making changes to files based on the requirements of the task at hand. this tool can also use to create new files by providing a new file name in the file field and the content to be added in the content field.",
        schema: z.object({
            files: z.array(z.object({
                file: z.string().describe("The absolute path of the file to update"),
                content: z.string().describe("The new content for the file, the content should support json format.")
            })).describe("The list of files to update and their new contents")
        })
    }
)