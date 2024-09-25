import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import dotenv from 'dotenv';
import { Octokit } from '@octokit/rest';
import unzipper from 'unzipper';
import stream from 'stream';

dotenv.config();

const app = express();

app.use(bodyParser.json());



app.post('/debugger', async (req, res) => {
    const { logUrl, status, repo, greptileKey, githubToken } = req.body;
    const octokit = new Octokit({
        auth: `${githubToken}`,
    });
    const repoOwner = repo.split('/')[0];
    const repoName = repo.split('/')[1];
    
    async function getBuildLog() {
        try {
            // Get the logs URL from the GitHub Actions API
            // https://github.com/Oia20/BuildFailureTestRepo/actions/runs/11039039298
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
    
                    // Handle the file as needed
                    let logs = '';
                    entry.on('data', (data) => {
                        logs += data.toString('utf-8');
                    });
    
                    entry.on('end', () => {
                        // After the entry is fully read, you can process the logs
                        console.log(`Logs from ${fileName}:`);
                        console.log(logs.substring(0, 1000)); // Log the first 1000 characters
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
    
    const buildLog = await getBuildLog();

    async function getDebuggingInfo() {
        const options = {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${greptileKey}`,
              'X-GitHub-Token': `${githubToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                  {
                    content: `As concisely as possible, debug this build error: ${buildLog}. How would I fix it?`,
                    role: "user"
                  }
                ],
                repositories: [
                  {
                    remote: "github",
                    branch: "main",
                    repository: `${repoOwner}/${repoName}`
                  }
                ]
              })
            };
          
          fetch('https://api.greptile.com/v2/query', options)
            .then(response => response.json())
            .then(response => console.log(response))
            .catch(err => console.error(err));
    }
    

    if (status === 'failure') {
        try {
            // Send the logs to the AI assistant for debugging
            const analysis = await getDebuggingInfo();
            console.log(analysis);

            // Send the response back to the user
            res.status(200).json({
                message: 'Build failed, analysis generated.',
                analysis,
            });
        } catch (error) {
            res.status(500).json({ message: 'Error analyzing log', error });
        }
    } else {
        res.status(200).send('Build succeeded.');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});