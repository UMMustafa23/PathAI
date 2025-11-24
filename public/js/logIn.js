const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");

let messagesArr;
if (
  localStorage.getItem(`${localStorage.getItem("sessionToken")}messagesArr`) &&
  `${localStorage.getItem("sessionToken")}messagesArr` != "nullmessagesArr"
) {
  document.location = "/HTML/test.html";
}

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

          messagesArr = JSON.parse(
            localStorage.getItem(
              `${localStorage.getItem("sessionToken")}messagesArr`
            )
          );

          document.location = "/HTML/test.html";
        } else {
          loginStatus.innerText = `Error: ${data.payload}`;
        }
      });
  }
};
