const socket = new WebSocket(`ws://${window.location.host}`);

const taskInput = document.querySelector("#taskInput");
const timeInput = document.querySelector("#timeInput");
const addTaskBtn = document.querySelector("#addTaskBtn");
const tasksList = document.querySelector("#tasksList");
const submitBtn = document.querySelector(".submit-btn");

socket.onopen = () => {
  console.log("WebSocket connection established.");
};

let tasks = [];

function formatTime(time) {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

addTaskBtn.onclick = () => {
  if (taskInput.value != "" && timeInput.value != "") {
    tasksList.innerHTML += `
        <div class="todo-item">
          <div class="todo-time">${formatTime(timeInput.value)}.</div>
          <div class="todo-text">${taskInput.value}</div>
        </div>
    `;

    tasks.push(taskInput.value + " at " + formatTime(timeInput.value));

    taskInput.value = "";
  }
};

submitBtn.onclick = () => {
  if (tasks.length > 0) {
    socket.send(`generate-daily-plan|${JSON.stringify(tasks)}`);

    document.querySelector(".loading-screen").style.display = "flex";
    document.querySelector(".loading-screen").style.pointerEvents = "all";
    window.scrollTo(0, document.body.scrollHeight);
  }
};

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type == "dailyPlan") {
    tasksList.innerHTML = "";
    tasksList.innerHTML = `
        <h1>Our AI planned\n the following</h1>
        <label class="ai-res-lbl">${message.data}</label>
    `;

    tasksList.style.color = "white";
    document.querySelector(".loading-screen").style.display = "none";
    document.querySelector(".loading-screen").style.pointerEvents = "none";

    if (
      localStorage.getItem(
        `${localStorage.getItem("sessionToken")}-dailyPlans`
      ) &&
      localStorage.getItem(
        `${localStorage.getItem("sessionToken")}-dailyPlans`
      ) != "null-dailyPlans" &&
      localStorage.getItem(`${localStorage.getItem("sessionToken")}-dailyPlans`)
        .length > 0
    ) {
      const existingPlans = JSON.parse(
        localStorage.getItem(
          `${localStorage.getItem("sessionToken")}-dailyPlans`
        )
      );

      existingPlans.push({
        date: new Date().toLocaleDateString(),
        numOfItems: tasks.length,
        plan: message.data,
        typeOfOutput: "dailyPlan",
      });

      localStorage.setItem(
        `${localStorage.getItem("sessionToken")}-dailyPlans`,
        JSON.stringify(existingPlans)
      );
    } else {
      const newPlans = [];
      newPlans.push({
        date: new Date().toLocaleDateString(),
        numOfItems: tasks.length,
        plan: message.data,
      });

      localStorage.setItem(
        `${localStorage.getItem("sessionToken")}-dailyPlans`,
        JSON.stringify(newPlans)
      );
    }
  }
};

window.onkeydown = (e) => {
  if (e.key === "Enter") {
    if (taskInput.value.length > 0) {
      addTaskBtn.click();
    }
  }
};

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
