const socket = new WebSocket(`ws://${location.host}`);

const chat = document.getElementById("chatContainer");
const sendBtn = document.getElementById("sendBtn");
const msgInput = document.getElementById("messageInput");

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

  window.scrollTo(0, document.body.scrollHeight);
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

//sidebar functionality
let isOpen = false;

function toggleNav() {
  const sidebar = document.getElementById("mySidenav");
  const arrow = document.getElementById("arrowIcon");
  const toggleBtn = document.getElementById("toggleBtn");

  if (isOpen) {
    sidebar.style.width = "0";
    sidebar.classList.remove("active");
    arrow.textContent = ">";
    toggleBtn.style.left = "0";

    const submenus = document.querySelectorAll(".submenu");
    submenus.forEach((submenu) => {
      submenu.style.display = "none";
    });

    const hasSubmenuItems = document.querySelectorAll(".has-submenu");
    hasSubmenuItems.forEach((item) => {
      item.classList.remove("active");
    });

    isOpen = false;
  } else {
    sidebar.style.width = "250px";
    sidebar.classList.add("active");
    arrow.textContent = "<";
    toggleBtn.style.left = "250px";
    isOpen = true;
  }
}

function toggleSubmenu(submenuId, element) {
  const submenu = document.getElementById(submenuId);

  if (submenu.style.display === "block") {
    submenu.style.display = "none";
    element.classList.remove("active");
  } else {
    submenu.style.display = "block";
    element.classList.add("active");
  }
}
