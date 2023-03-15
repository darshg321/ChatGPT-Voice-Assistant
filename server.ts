const express = require('express');
const fs = require('fs');
const {Configuration, OpenAIApi} = require('openai');

const PORT: number = 8080;

const app = express();
app.use(express.json());

app.get('/', (request, response): void => {
    fs.readFile('./index.html', 'utf8', (err, html) => {
        if (err) {
            response.status(500).send('not working');
        }
        response.send(html);
    })
});

app.get('/index.html', (request, response): void => {
    fs.readFile('./index.html', 'utf8', (err, html) => {
        if (err) {
            response.status(500).send('not working');
        }
        response.send(html);
    })
});

app.get('/script.js', (request, response): void => {
    fs.readFile('./script.js', 'utf8', (err, js) => {
        if (err) {
            response.status(500).send('not working');
        }
        response.set('Content-Type', 'application/javascript')
        response.send(js);
    })
});

app.get('/styles.css', (request, response): void => {
    fs.readFile('./styles.css', 'utf8', (err, css) => {
        if (err) {
            response.status(500).send('not working');
        }
        response.set('Content-Type', 'text/css')
        response.send(css);
    })
});

app.get('/assets/:filename', (request, response) => {
    let filename = request.params.filename;
    fs.readFile(`./assets/${filename}`, (err, image) => {
        if (err) {
            response.status(500).send('not working');
        }
        response.set('Content-Type', 'image');
        response.send(image);
    })
});

app.post('/api/getrequest', async function (req, res) {
    try {
        let replyData: any =  await sendPrompt(req.body.apiKey, "gpt-3.5-turbo", req.body.role, req.body.prompt);
        res.status(200).send(replyData);

    }
    catch (error) {
        console.error(error);
    }
});

async function sendPrompt(API_KEY: string, Model: string, Role: string, Prompt: string): Promise<object> {
    const configuration = new Configuration({
        apiKey: API_KEY
    });
    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
        model: Model,
        messages: [
            {role: "system", content: Role}, // #1 Initial Prompt
            {role: "user", content: "Who won the world series in 2020?"}, // #2 This is an example question
            {
                role: "assistant", // #3 this is an example answer
                content:
                    "The Los Angeles Dodgers won the World Series in 2020.",
            },
            {role: "user", content: Prompt}, //  #4 This is the actual question
        ],
    });
    return completion.data;
}

app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));