const socket = new WebSocket("ws://localhost:3000");

const chat = document.getElementById("chat");
const sendBtn = document.getElementById("sendBtn");
const msgInput = document.getElementById("msgInput");

socket.onopen = () => {
  console.log("WebSocket connection established.");
};

let messagesArr;
const getMessagesFromStorage = () => {
  const storedMessages = localStorage.getItem(
    `${localStorage.getItem("sessionToken")}messagesArr`
  );

  if (storedMessages && storedMessages !== "nullmessagesArr") {
    return JSON.parse(storedMessages);
  }
};
messagesArr = getMessagesFromStorage();

const fillMessages = () => {
  chat.innerHTML = "";

  messagesArr.forEach((msg) => {
    if (msg.role === "user" || msg.role === "system") {
      const userBubble = document.createElement("div");
      userBubble.className = "message user-message";
      userBubble.textContent = msg.content;
      chat.appendChild(userBubble);
    } else if (msg.role === "assistant") {
      const botBubble = document.createElement("div");
      botBubble.className = "message";
      botBubble.textContent = msg.content;
      chat.appendChild(botBubble);
    }
  });
};
fillMessages();

const saveMessageHistory = () => {
  localStorage.setItem(
    `${localStorage.getItem("sessionToken")}messagesArr`,
    JSON.stringify(messagesArr)
  );
};

chat.scrollTop = chat.scrollHeight;

sendBtn.addEventListener("click", sendMessage);
msgInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;

  msgInput.value = "";

  messagesArr.push({
    role: "user",
    content: text,
  });

  fillMessages();
  saveMessageHistory();

  socket.send(`messageAiAssistant|${JSON.stringify(messagesArr)}`);
  chat.scrollTop = chat.scrollHeight;
}

window.onbeforeunload = () => {
  saveMessageHistory();
};

socket.onmessage = (event) => {
  const receivedMsg = JSON.parse(event.data);
  if (receivedMsg.type === "aiAssistantResponse") {
    messagesArr.push({
      role: "assistant",
      content: receivedMsg.data,
    });
    fillMessages();
    saveMessageHistory();
    chat.scrollTop = chat.scrollHeight;
  }
};
