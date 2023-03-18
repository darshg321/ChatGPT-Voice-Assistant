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
var apiKey = '';
var micButtonClicked = false;
function micButton() {
    if (!micButtonClicked) {
        micButtonClicked = true;
        Main();
    }
}
function getAudio() {
    return __awaiter(this, void 0, void 0, function () {
        var micButton;
        var _this = this;
        return __generator(this, function (_a) {
            console.log("started");
            micButton = document.getElementById("startMic");
            micButton.classList.toggle('recording');
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var stream, mediaRecorder_1, chunks_1, timeoutId, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, navigator.mediaDevices.getUserMedia({ audio: true })];
                            case 1:
                                stream = _a.sent();
                                mediaRecorder_1 = new MediaRecorder(stream);
                                chunks_1 = [];
                                mediaRecorder_1.addEventListener('dataavailable', function (e) {
                                    chunks_1.push(e.data);
                                });
                                mediaRecorder_1.addEventListener('stop', function () {
                                    console.log("stopped audio");
                                    micButton.classList.toggle('recording');
                                    var audioBlob = new Blob(chunks_1);
                                    resolve(audioBlob);
                                });
                                micButton.addEventListener('click', function () {
                                    if (!(mediaRecorder_1.state === "inactive")) {
                                        mediaRecorder_1.stop();
                                    }
                                });
                                mediaRecorder_1.start();
                                timeoutId = setTimeout(function () {
                                    if (mediaRecorder_1.state === "recording") {
                                        mediaRecorder_1.stop();
                                        console.log("stopped audio");
                                        micButton.classList.toggle('recording');
                                        var audioBlob = new Blob(chunks_1);
                                        resolve(audioBlob);
                                    }
                                }, 15000);
                                return [3 /*break*/, 3];
                            case 2:
                                error_1 = _a.sent();
                                console.error('Failed to access user media', error_1);
                                alert("Accept Mic Permission to use");
                                location.reload();
                                reject(error_1);
                                return [2 /*return*/, false];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
function transcribeAudio(audioBlob) {
    return new Promise(function (resolve, reject) {
        var formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');
        fetch('/api/transcribe', {
            method: 'POST',
            body: formData
        })
            .then(function (response) { return response.text(); })
            .then(function (text) { return resolve(text); })["catch"](function (error) {
            console.error('Error occurred while making API call:', error);
            reject(error);
        });
    });
}
function fetchPrompt(fullPrompt) {
    return fetch('/api/getrequest', {
        method: 'POST',
        body: JSON.stringify(fullPrompt),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(function (response) {
        if (!response.ok) {
            throw new Error("API call failed with status ".concat(response.status));
        }
        console.log('API call succeeded');
        return response.json();
    })["catch"](function (error) {
        console.error('Error occurred while making API call:', error);
        throw error;
    });
}
function speakText(text) {
    if (!('speechSynthesis' in window)) {
        alert("Sorry, your browser doesn't support text to speech!");
        return;
    }
    var textToSpeech = new SpeechSynthesisUtterance();
    textToSpeech.text = text;
    window.speechSynthesis.speak(textToSpeech);
}
function Main() {
    return __awaiter(this, void 0, void 0, function () {
        var blobData, audioText, fullPrompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAudio()];
                case 1:
                    blobData = _a.sent();
                    console.log("got audio");
                    return [4 /*yield*/, transcribeAudio(blobData)];
                case 2:
                    audioText = _a.sent();
                    console.log("got audio text: " + audioText);
                    fullPrompt = {
                        Prompt: audioText,
                        apiKey: apiKey,
                        role: "Be a helpful assistant."
                    };
                    fetchPrompt(fullPrompt)
                        .then(function (replyData) {
                        if (!replyData) {
                            console.log("Error getting Prompt");
                            return;
                        }
                        console.log("got reply data");
                        var messageBody = document.getElementById("messageBody");
                        messageBody.innerText = replyData.choices[0].message.content;
                        speakText(replyData.choices[0].message.content);
                    })["catch"](function (error) {
                        console.error("Error occurred while fetching Prompt:", error);
                    });
                    micButtonClicked = false;
                    return [2 /*return*/];
            }
        });
    });
}
