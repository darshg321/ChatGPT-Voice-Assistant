const express = require('express');
const fs = require('fs');
const {Configuration, OpenAIApi} = require('openai');
const { PythonShell } = require('python-shell');
const multer  = require('multer');
const path = require('path');
const upload = multer({ dest: './' });

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
        console.log(req.body)
        let replyData: any =  await sendPrompt(req.body.apiKey, "gpt-3.5-turbo", req.body.role, req.body.Prompt);
        res.status(200).send(replyData);

    }
    catch (error) {
        console.error(error);
    }
});

app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
    const filePath: string = path.join(__dirname, req.file.path) + '.wav';
    let audioFilename: string = req.file.path.split('/').pop() + '.wav';
    console.log("Saved Audio to: " + audioFilename)
    fs.renameSync(req.file.path, filePath); // set file extension
    let audioText: string | Promise<never> = await transcribeAudio(audioFilename);
    fs.unlink(filePath, () => {
        console.log("Deleted file");
    });
    console.log(audioText)

    res.status(200).send(audioText);
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

function transcribeAudio(audioFile): Promise<string> {
    return new Promise((resolve, reject) => {
        // specify the path to the Python file
        const pythonFile = './transcribeFile.py';

        // set up the options for Python shell
        const options = {
            mode: 'text',
            pythonPath: '/usr/bin/python3', // the path to your Python executable
            args: [audioFile]
        };

        // create a new Python shell instance
        let pyshell = new PythonShell(pythonFile, options);

        let output: string = '';

        // listen for messages coming from the Python script
        pyshell.on('message', function(message) {
            output += message + '\n';
        });

        // listen for errors from the Python script
        pyshell.on('error', function(err) {
            reject(err);
        });

        // end the input stream and wait for the shell to exit
        pyshell.end(function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(output);
            }
        });
    });
}

app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));