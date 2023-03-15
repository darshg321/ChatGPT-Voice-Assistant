function maybeValidKey(key) {
    key.replace(/\s+/g, '');
    // test if the string contains symbols after the first 3 char
    var regex = /^.{3}\W+.*$/;
    return key.startsWith('sk-') && !regex.test(key);
}
function submitForm(event) {
    event.preventDefault();
    var gptRequest = document.getElementById("GPTRequest")["value"];
    var apiKey = document.getElementById("APIKey")["value"];
    var gptRole = document.getElementById("GPTRole")["value"];
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
        document.querySelector("form").reset();
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
function Main(event) {
    var fullPrompt = submitForm(event);
    if (fullPrompt === undefined) {
        return;
    }
    fetchPrompt(fullPrompt)
        .then(function (replyData) {
        if (!replyData) {
            console.log("Error getting prompt");
            return;
        }
        var messageBody = document.getElementById("messageBody");
        messageBody.innerText = replyData.choices[0].message.content;
        speakText(replyData.choices[0].message.content);
    })["catch"](function (error) {
        console.error("Error occurred while fetching prompt:", error);
    });
}
