const API_KEY = "AIzaSyC62lW7zT2HDxK6RWgt8rBLB-cvvzszJUM";

const inputField = document.getElementById("userInput");
const sendButton = document.getElementById("sendBtn");
const chatContainer = document.getElementById("chatContainer");
const typingRow = document.getElementById("typingRow");
const imageBtn = document.getElementById("imageBtn");
const imageInput = document.getElementById("imageInput");

let uploadedImageBase64 = null;

sendButton.addEventListener("click", sendMessage);
inputField.addEventListener("keypress", e => { if (e.key === "Enter") sendMessage(); });

// Open gallery
imageBtn.addEventListener("click", () => imageInput.click());

// Handle image selection
imageInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        uploadedImageBase64 = event.target.result.split(",")[1];
        addMessage(`<img src="${event.target.result}" />`, "user");
    }
    reader.readAsDataURL(file);
});

function addMessage(text, sender) {
    const row = document.createElement("div");
    row.classList.add("message-row", sender);

    const avatar = document.createElement("div");
    avatar.classList.add("avatar");
    avatar.innerHTML = `<img src="${sender === 'ai' ? 'download.jpg' : 'download.png'}" alt="${sender}">`;

    const bubble = document.createElement("div");
    bubble.classList.add("bubble", sender);
    bubble.innerHTML = text;

    row.appendChild(avatar);
    row.appendChild(bubble);
    chatContainer.appendChild(row);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendMessage() {
    const userMessage = inputField.value.trim();
    if (!userMessage && !uploadedImageBase64) return;

    if (userMessage) addMessage(userMessage, "user");
    inputField.value = "";
    typingRow.style.display = "flex";

    let body = { contents: [{ parts: [] }] };
    if (userMessage) body.contents[0].parts.push({ text: userMessage });
    if (uploadedImageBase64) {
        body.contents[0].parts.push({ inline_data: { mime_type: "image/jpeg", data: uploadedImageBase64 } });
        uploadedImageBase64 = null;
    }

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        typingRow.style.display = "none";

        let aiMessage = "Sorry, I couldn't understand that.";
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            aiMessage = data.candidates[0].content.parts[0].text;
        }
        addMessage(aiMessage, "ai");
    } catch (err) {
        typingRow.style.display = "none";
        addMessage("Error: Could not connect to AI", "ai");
        console.error(err);
    }
}