import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import dotenv from 'dotenv';
import { Octokit } from '@octokit/rest';
import unzipper from 'unzipper';
import stream from 'stream';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(bodyParser.json());

const corsOptions = {
    origin: "*",
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-GitHub-Token'],
};
app.use(cors(corsOptions));



app.post('/debugger', async (req, res) => {
    res.send('POST request received at /debugger');
    console.log('Received POST request at /debugger');
    const { logUrl, status, repo, greptileKey, githubToken, webhookUrl } = req.body;
    console.log("request body: ", req.body);

    const octokit = new Octokit({
        auth: `${githubToken}`,
    });

    const repoOwner = repo.split('/')[0];
    const repoName = repo.split('/')[1];
    
    async function getBuildLog() {
        console.log('Getting build log...');
        try {
            console.log("logUrl: ", logUrl + "/logs");
            // Get the download URL from the GitHub Actions API
            const response = await octokit.request(`GET ${logUrl}/logs`, {
            });
    
            // Fetch the logs using the URL from the response
            const logsResponse = await axios.get(response.url, { responseType: 'arraybuffer' });
    
            // Log the response headers for debugging
            console.log('Response Headers:', logsResponse.headers);
            console.log('Response Data Length:', logsResponse.data.length);
    
            // Convert response data to a readable stream
            const bufferStream = new stream.PassThrough();
            bufferStream.end(logsResponse.data);
    
            // Unzip the contents of the ZIP file
            bufferStream
                .pipe(unzipper.Parse())
                .on('entry', (entry) => {
                    const fileName = entry.path; // Get the name of the file inside the ZIP
                    console.log(`Extracting: ${fileName}`);

                    let logs = '';
                    entry.on('data', (data) => {
                        logs += data.toString('utf-8');
                    });
    
                    entry.on('end', () => {
                        // After the entry is fully read, we can process the logs
                        console.log(`Logs from ${fileName}:`);
                        console.log(logs.substring(0, 1000)); // Reading the first 1000 characters (All we should need)
                        return logs;
                    });
                })
                .on('close', () => {
                    console.log('All entries processed.');
                })
                .on('error', (err) => {
                    console.error('Error during unzipping:', err);
                });
    
        } catch (error) {
            console.error('Error fetching the build log:', error);
        }
    }
    
    // This timeout is a bit hacky, but it's a way to ensure the build has finished before we try to download the logs. If for example we used an official Github app, we could instead recieve a webhook whenever the build finishes which would eliminate the need for this timeout.
    setTimeout(async () => {
        const buildLog = await getBuildLog();
    
        async function getDebuggingInfo() {
            console.log('Getting debugging info...');
            const options = {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${greptileKey}`,
                    'X-GitHub-Token': `${githubToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [{
                        content: `As concisely as possible, debug this build error: ${buildLog}. How would I fix it?`,
                        role: "user"
                    }],
                    repositories: [{
                        remote: "github",
                        branch: "main",
                        repository: `${repoOwner}/${repoName}`
                    }]
                })
            };
    
            try {
                const response = await fetch('https://api.greptile.com/v2/query', options);
                const data = await response.json();
                console.log(data.message);
                return data.message;
            } catch (err) {
                console.error('Error fetching debugging info', err);
                throw err;
            }
        }
    
        if (status === 'failure') {
            console.log('Status is failure');
            try {
                const analysis = await getDebuggingInfo();
                await sendWebhook(analysis);
                console.log('Analysis sent via webhook:', analysis);
            } catch (error) {
                console.error('Error analyzing log', error);
            }
        }
    }, 20000);
    
    const sendWebhook = async (analysis) => {
        console.log('Sending webhook...');
        try {
            await axios.post(webhookUrl, {
                content: analysis,
            });
            console.log('Webhook sent successfully');
        } catch (error) {
            console.error('Error sending webhook', error);
            throw error;
        }
    };
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});