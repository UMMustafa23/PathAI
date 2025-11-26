const socket = new WebSocket(`ws://${window.location.host}`);

socket.onopen = () => {
  console.log("WebSocket connection established.");
};

let tasks = [];

const taskInput = (document.querySelector(".task-field").oninput = () => {
  if (document.querySelector(".task-field").value.length > 0) {
    document.querySelector(".bottom-btn").setAttribute("action", "add-task");
    document.querySelector(".bottom-btn").innerText = "Add Task +";
  } else {
    document.querySelector(".bottom-btn").setAttribute("action", "gen");
    document.querySelector(".bottom-btn").innerText = "Generate plan >";
  }
});

document.querySelector(".bottom-btn").onclick = (t) => {
  if (t.target.getAttribute("action") == "add-task") {
    document.querySelector(".todo-list").innerHTML += `
        <div class="todo-item">
          <div class="todo-time">${
            document.querySelectorAll(".todo-item").length + 1
          }.</div>
          <div class="todo-text">${
            document.querySelector(".task-field").value
          }</div>
        </div>
    `;

    tasks.push(document.querySelector(".task-field").value);

    document.querySelector(".task-field").value = "";

    if (document.querySelector(".task-field").value.length > 0) {
      document.querySelector(".bottom-btn").setAttribute("action", "add-task");
      document.querySelector(".bottom-btn").innerText = "Add Task +";
    } else {
      document.querySelector(".bottom-btn").setAttribute("action", "gen");
      document.querySelector(".bottom-btn").innerText = "Generate plan >";
    }
  } else if (t.target.getAttribute("action") == "gen") {
    socket.send(`generate-daily-plan|${JSON.stringify(tasks)}`);
  }
};

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type == "dailyPlan") {
    document.querySelector(".todo-list").innerHTML = "";
    document.querySelector(".todo-list").innerHTML = `
        <h1>Our AI planned\n the following</h1>
        <label class="ai-res-lbl">${message.data}</label>
    `;

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
    if (document.querySelector(".task-field").value.length > 0) {
      document.querySelector(".bottom-btn").click();
      if (document.querySelector(".task-field").value.length > 0) {
        document
          .querySelector(".bottom-btn")
          .setAttribute("action", "add-task");
        document.querySelector(".bottom-btn").innerText = "Add Task +";
      } else {
        document.querySelector(".bottom-btn").setAttribute("action", "gen");
        document.querySelector(".bottom-btn").innerText = "Generate plan >";
      }
    }
  }
};
