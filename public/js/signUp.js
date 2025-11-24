const regEmail = document.querySelector("#regEmail");
const regPassword = document.querySelector("#regPassword");
const regUsername = document.querySelector("#regUsername");
const regGender = document.querySelector("#regGender");
const regAge = document.querySelector("#regAge");
const regGrade = document.querySelector("#regGrade");
const regmajor = document.querySelector("#regMajor");
const regInstitution = document.querySelector("#regInstitution");
const regRegion = document.querySelector("#regRegion");

let messagesArr;
if (
  localStorage.getItem(`${localStorage.getItem("sessionToken")}messagesArr`) &&
  `${localStorage.getItem("sessionToken")}messagesArr` != "nullmessagesArr"
) {
  document.location = "/HTML/test.html";
}

document.querySelector(".regBtn").onclick = () => {
  const userData = {
    username: regUsername.value,
    email: regEmail.value,
    password: regPassword.value,
    age: regAge.value,
    grade: regGrade.value,
    eduInst: regInstitution.value,
    gender: regGender.value,
    region: regRegion.value,
  };

  if (
    userData.username != "" &&
    userData.email != "" &&
    userData.password != "" &&
    userData.age != "" &&
    userData.grade != "" &&
    userData.region != "" &&
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

          messagesArr = [
            {
              role: "system",
              content:
                "You are a helpful career orientation assistant. You help students choose their career paths based on their interests and skills. And you provide resources and guidance to help them achieve their goals.",
            },
          ];

          localStorage.setItem(
            `${atob(data.sessionToken)}messagesArr`,
            JSON.stringify(messagesArr)
          );

          document.location = "/HTML/test.html";
        } else {
          regStatus.innerText = `Error: ${data.payload}`;
        }
      });
  }
};
