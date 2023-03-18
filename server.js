var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var express = require('express');
var fs = require('fs');
var _a = require('openai'), Configuration = _a.Configuration, OpenAIApi = _a.OpenAIApi;
var PythonShell = require('python-shell').PythonShell;
var multer = require('multer');
var path = require('path');
var upload = multer({ dest: './' });
var PORT = 8080;
var app = express();
app.use(express.json());
app.get('/', function (request, response) {
    fs.readFile('./index.html', 'utf8', function (err, html) {
        if (err) {
            response.status(500).send('not working');
        }
        response.send(html);
    });
});
app.get('/index.html', function (request, response) {
    fs.readFile('./index.html', 'utf8', function (err, html) {
        if (err) {
            response.status(500).send('not working');
        }
        response.send(html);
    });
});
app.get('/script.js', function (request, response) {
    fs.readFile('./script.js', 'utf8', function (err, js) {
        if (err) {
            response.status(500).send('not working');
        }
        response.set('Content-Type', 'application/javascript');
        response.send(js);
    });
});
app.get('/styles.css', function (request, response) {
    fs.readFile('./styles.css', 'utf8', function (err, css) {
        if (err) {
            response.status(500).send('not working');
        }
        response.set('Content-Type', 'text/css');
        response.send(css);
    });
});
app.get('/assets/:filename', function (request, response) {
    var filename = request.params.filename;
    fs.readFile("./assets/".concat(filename), function (err, image) {
        if (err) {
            response.status(500).send('not working');
        }
        response.set('Content-Type', 'image');
        response.send(image);
    });
});
app.post('/api/getrequest', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var replyData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log(req.body);
                    return [4 /*yield*/, sendPrompt(req.body.apiKey, "gpt-3.5-turbo", req.body.role, req.body.Prompt)];
                case 1:
                    replyData = _a.sent();
                    res.status(200).send(replyData);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error(error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
});
app.post('/api/transcribe', upload.single('audio'), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var filePath, audioFilename, audioText;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                filePath = path.join(__dirname, req.file.path) + '.wav';
                audioFilename = req.file.path.split('/').pop() + '.wav';
                console.log("Saved Audio to: " + audioFilename);
                fs.renameSync(req.file.path, filePath); // set file extension
                return [4 /*yield*/, transcribeAudio(audioFilename)];
            case 1:
                audioText = _a.sent();
                fs.unlink(filePath, function () {
                    console.log("Deleted file");
                });
                console.log(audioText);
                res.status(200).send(audioText);
                return [2 /*return*/];
        }
    });
}); });
function sendPrompt(API_KEY, Model, Role, Prompt) {
    return __awaiter(this, void 0, void 0, function () {
        var configuration, openai, completion;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    configuration = new Configuration({
                        apiKey: API_KEY
                    });
                    openai = new OpenAIApi(configuration);
                    return [4 /*yield*/, openai.createChatCompletion({
                            model: Model,
                            messages: [
                                { role: "system", content: Role },
                                { role: "user", content: "Who won the world series in 2020?" },
                                {
                                    role: "assistant",
                                    content: "The Los Angeles Dodgers won the World Series in 2020."
                                },
                                { role: "user", content: Prompt }, //  #4 This is the actual question
                            ]
                        })];
                case 1:
                    completion = _a.sent();
                    return [2 /*return*/, completion.data];
            }
        });
    });
}
function transcribeAudio(audioFile) {
    return new Promise(function (resolve, reject) {
        // specify the path to the Python file
        var pythonFile = './transcribeFile.py';
        // set up the options for Python shell
        var options = {
            mode: 'text',
            pythonPath: '/usr/bin/python3',
            args: [audioFile]
        };
        // create a new Python shell instance
        var pyshell = new PythonShell(pythonFile, options);
        var output = '';
        // listen for messages coming from the Python script
        pyshell.on('message', function (message) {
            output += message + '\n';
        });
        // listen for errors from the Python script
        pyshell.on('error', function (err) {
            reject(err);
        });
        // end the input stream and wait for the shell to exit
        pyshell.end(function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve(output);
            }
        });
    });
}
app.listen(PORT, function () { return console.log("Running on http://localhost:".concat(PORT)); });
