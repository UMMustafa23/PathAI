if (
  localStorage.getItem(`${localStorage.getItem("sessionToken")}-dailyPlans`) &&
  localStorage.getItem(`${localStorage.getItem("sessionToken")}-dailyPlans`) !=
    "null-dailyPlans" &&
  localStorage.getItem(`${localStorage.getItem("sessionToken")}-dailyPlans`)
    .length > 0
) {
  let existingPlans = [];
  existingPlans = JSON.parse(
    localStorage.getItem(`${localStorage.getItem("sessionToken")}-dailyPlans`)
  );
  console.log(existingPlans);

  document.querySelector(".outputs-list").innerHTML = "";

  existingPlans.forEach((plan, i) => {
    document.querySelector(".outputs-list").innerHTML += `
        <div class="output-item" pos="${i}">
            <div for="output-item item${i}" class="output-time">${plan.date}</div>
            <div for="output-item item${i}" class="output-text">${plan.numOfItems} tasks</div>
        </div>
    `;
  });

  document.querySelectorAll(".output-item").forEach((item, index) => {
    item.onclick = (t) => {
      const i = t.target.getAttribute("pos");
      const plan = existingPlans[i];
      console.log(plan);

      document.querySelector(".outputs-list").innerHTML = "";
      document.querySelector(".outputs-list").innerHTML = `
        <h1>${plan.date}</h1>>
        <label class="ai-res-lbl">${plan.plan}</label>
    `;
    };
  });
}
