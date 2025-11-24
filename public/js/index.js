const socket = new WebSocket("ws://localhost:3000");

const regEmail = document.querySelector("#regEmail");
const regPassword = document.querySelector("#regPassword");
const regUsername = document.querySelector("#regUsername");
const regGender = document.querySelector("#regGender");
const regAge = document.querySelector("#regAge");
const regGrade = document.querySelector("#regGrade");
const regmajor = document.querySelector("#regMajor");
const regInstitution = document.querySelector("#regInstitution");
const regStatus = document.querySelector("#regStatus");
const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");
const loginStatus = document.querySelector("#loginStatus");

socket.onopen = () => {
  console.log("WebSocket connection established.");
};

let messagesArr;
if (
  localStorage.getItem(`${localStorage.getItem("sessionToken")}messagesArr`) &&
  `${localStorage.getItem("sessionToken")}messagesArr` != "nullmessagesArr"
) {
  messagesArr = JSON.parse(
    localStorage.getItem(`${localStorage.getItem("sessionToken")}messagesArr`)
  );

  console.log(
    (messagesArr = JSON.parse(
      localStorage.getItem(`${localStorage.getItem("sessionToken")}messagesArr`)
    ))
  );
} else {
  messagesArr = [
    {
      role: "system",
      content: "Login or create an account to use the chat bot",
    },
  ];
}

const fillMessages = () => {
  document.querySelector(".messages-container").innerHTML = "";

  messagesArr.forEach((msg) => {
    document.querySelector(
      ".messages-container"
    ).innerHTML += `<div class="message">${msg.role}: ${msg.content}</div>`;
  });
};
fillMessages();

const saveMessageHistory = () => {
  localStorage.setItem(
    `${localStorage.getItem("sessionToken")}messagesArr`,
    JSON.stringify(messagesArr)
  );
};

document.querySelector(".send-btn").onclick = () => {
  if (
    localStorage.getItem(
      `${localStorage.getItem("sessionToken")}messagesArr`
    ) &&
    `${localStorage.getItem("sessionToken")}messagesArr` != "nullmessagesArr" &&
    document.querySelector(".message-input").value != ""
  ) {
    messagesArr.push({
      role: "user",
      content: document.querySelector(".message-input").value,
    });

    document.querySelector(".message-input").value = "";
    fillMessages();
    saveMessageHistory();

    socket.send(`messageAiAssistant|${JSON.stringify(messagesArr)}`);
  }
};

document.onkeydown = (event) => {
  if (event.key === "Enter") {
    document.querySelector(".send-btn").click();
  }
};

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
  }
};

document.querySelector(".regBtn").onclick = () => {
  const userData = {
    username: regUsername.value,
    email: regEmail.value,
    password: regPassword.value,
    age: regAge.value,
    grade: regGrade.value,
    major: regmajor.value,
    eduInst: regInstitution.value,
    gender: regGender.value,
  };

  if (
    userData.username != "" &&
    userData.email != "" &&
    userData.password != "" &&
    userData.age != "" &&
    userData.grade != "" &&
    userData.major != "" &&
    userData.eduInst != "" &&
    userData.gender != ""
  ) {
    fetch(`/createAccount?userData=${btoa(JSON.stringify(userData))}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data.payload);
        console.log(atob(data.sessionToken));

        if (data.payload == true) {
          localStorage.setItem("sessionToken", atob(data.sessionToken));

          regStatus.innerText = `Signed up successfully! Your session token is: ${atob(
            data.sessionToken
          )}`;

          messagesArr = [
            {
              role: "system",
              content:
                "Your are a helpful career orientation assistant. You help students choose their career paths based on their interests and skills. And you provide resources and guidance to help them achieve their goals.",
            },
          ];

          localStorage.setItem(
            `${atob(data.sessionToken)}messagesArr`,
            JSON.stringify(messagesArr)
          );
        } else {
          regStatus.innerText = `Error: ${data.payload}`;
        }
      });
  }
};

document.querySelector(".login-btn").onclick = () => {
  const loginData = {
    email: loginEmail.value,
    password: loginPassword.value,
  };

  if (loginData.email != "" && loginData.password != "") {
    fetch(`/logintoAccount?userData=${btoa(JSON.stringify(loginData))}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data.payload);
        console.log(atob(data.sessionToken));

        if (data.payload == true) {
          localStorage.setItem("sessionToken", atob(data.sessionToken));
          loginStatus.innerText = `Logged in successfully! Your session token is: ${atob(
            data.sessionToken
          )}`;

          messagesArr = JSON.parse(
            localStorage.getItem(
              `${localStorage.getItem("sessionToken")}messagesArr`
            )
          );
          fillMessages();
        } else {
          loginStatus.innerText = `Error: ${data.payload}`;
        }
      });
  }
};

document.querySelector(".logout-btn").onclick = () => {
  localStorage.removeItem("sessionToken");
  localStorage.removeItem(`nullmessagesArr`);
  location.reload();
};
