const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

app.use(bodyParser.json());

app.post('/build-log', async (req, res) => {
    const { log, status, repo, greptileKey, githubToken } = req.body;

    async function getDebuggingInfo(log) {
        const options = {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.GREPTILE_API_KEY}`,
              'X-GitHub-Token': `${process.env.GITHUB_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: `{"messages":[{,"content":"Consisely debug this build error ${log}. How would I fix it?"","role":"<string>"}],"repositories":[{"remote":"<string>","branch":"<string>","repository":"<string>"}]}`
          };
          
          fetch('https://api.greptile.com/v2/query', options)
            .then(response => response.json())
            .then(response => console.log(response))
            .catch(err => console.error(err));
    }
    

    if (status === 'failure') {
        try {
            // Send the logs to the AI assistant for debugging
            const analysis = await getDebuggingInfo(log);

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