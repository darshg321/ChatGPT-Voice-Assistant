const apiKey: string = '';

let micButtonClicked: boolean = false;
function micButton() {
    if (!micButtonClicked) {
        micButtonClicked = true;
        Main();
    }
}

async function getAudio() {
    console.log("started");
    const micButton = document.getElementById("startMic");
    micButton.classList.toggle('recording');

    return new Promise(async (resolve, reject): Promise<Blob | boolean> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            let mediaRecorder = new MediaRecorder(stream);
            let chunks = [];

            mediaRecorder.addEventListener('dataavailable', (e) => {
                chunks.push(e.data);
            });

            mediaRecorder.addEventListener('stop', () => {
                console.log("stopped audio");
                micButton.classList.toggle('recording');
                let audioBlob: Blob = new Blob(chunks);
                resolve(audioBlob);
            });

            micButton.addEventListener('click', () => {
                if (!(mediaRecorder.state === "inactive")) {
                    mediaRecorder.stop();
                }
            });
            mediaRecorder.start();
            let timeoutId = setTimeout(() => {
                if (mediaRecorder.state === "recording") {
                    mediaRecorder.stop();
                    console.log("stopped audio");
                    micButton.classList.toggle('recording');
                    let audioBlob: Blob = new Blob(chunks);
                    resolve(audioBlob);
                }
            }, 15000); // Set time limit to 15 seconds
        }
        catch (error) {
            console.error('Failed to access user media', error);
            alert("Accept Mic Permission to use")
            location.reload();
            reject(error);
            return false;
        }
    });
}

function transcribeAudio(audioBlob) {
    return new Promise((resolve, reject) => {
        let formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

        fetch('/api/transcribe', {
            method: 'POST',
            body: formData
        })
            .then(response => response.text())
            .then((text) => resolve(text))
            .catch(error => {
                console.error('Error occurred while making API call:', error);
                reject(error);
            });
    });
}

function fetchPrompt(fullPrompt: { role: string; apiKey: string; Prompt: unknown }): Promise<any> {
    return fetch('/api/getrequest', {
        method: 'POST',
        body: JSON.stringify(fullPrompt),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`API call failed with status ${response.status}`);
            }
            console.log('API call succeeded');
            return response.json();
        })
        .catch(error => {
            console.error('Error occurred while making API call:', error);
            throw error;
        });
}

function speakText(text): void {
    if (!('speechSynthesis' in window)) {
        alert("Sorry, your browser doesn't support text to speech!");
        return;
    }
    let textToSpeech = new SpeechSynthesisUtterance();
    textToSpeech.text = text;
    window.speechSynthesis.speak(textToSpeech);
}

async function Main(): Promise<void> {

    let blobData = await getAudio();
    console.log("got audio")
    let audioText = await transcribeAudio(blobData)
    console.log("got audio text: " + audioText)

    let fullPrompt = {
        Prompt: audioText,
        apiKey: apiKey,
        role: "Be a helpful assistant."
    }

    fetchPrompt(fullPrompt)
        .then(replyData => {
            if (!replyData) {
                console.log("Error getting Prompt");
                return;
            }
            console.log("got reply data")

            let messageBody: HTMLElement = document.getElementById("messageBody");
            messageBody.innerText = replyData.choices[0].message.content;

            speakText(replyData.choices[0].message.content);
        })
        .catch(error => {
            console.error("Error occurred while fetching Prompt:", error);
        });
    micButtonClicked = false;
}
