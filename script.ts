function maybeValidKey(key: string): boolean {
    key.replace(/\s+/g, '')
    // test if the string contains symbols after the first 3 char
    const regex: RegExp = /^.{3}\W+.*$/;
    return key.startsWith('sk-') && !regex.test(key);
}

function submitForm(event): { role: string; apiKey: string; prompt: string } {
    event.preventDefault();
    let gptRequest: string = document.getElementById("GPTRequest")["value"];
    let apiKey: string = document.getElementById("APIKey")["value"];
    let gptRole: string = document.getElementById("GPTRole")["value"];

    if (!maybeValidKey(apiKey)) {
        alert("Invalid Api Key!");
        return;
    }
    else if (gptRequest.length > 100 || gptRole.length > 100) {
        alert("Prompt and role must be less than 100 characters!");
        return;
    }
    return {
        prompt: gptRequest,
        apiKey: apiKey,
        role: gptRole
    };
}

function fetchPrompt(fullPrompt: { prompt: string; apiKey: string; role: string; }): Promise<any> {
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
            document.querySelector("form").reset();
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

function Main(event): void {
    let fullPrompt = submitForm(event);
    if (fullPrompt === undefined) {
        return;
    }

    fetchPrompt(fullPrompt)
        .then(replyData => {
            if (!replyData) {
                console.log("Error getting prompt");
                return;
            }

            let messageBody: HTMLElement = document.getElementById("messageBody");
            messageBody.innerText = replyData.choices[0].message.content;

            speakText(replyData.choices[0].message.content);
        })
        .catch(error => {
            console.error("Error occurred while fetching prompt:", error);
        });
}