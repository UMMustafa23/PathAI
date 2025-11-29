const outputsGrid = document.querySelector(".outputs-grid");
let existingPlans = [];

if (
  localStorage.getItem(`${localStorage.getItem("sessionToken")}-dailyPlans`) &&
  localStorage.getItem(`${localStorage.getItem("sessionToken")}-dailyPlans`) !=
    "null-dailyPlans" &&
  localStorage.getItem(`${localStorage.getItem("sessionToken")}-dailyPlans`)
    .length > 0
) {
  existingPlans = JSON.parse(
    localStorage.getItem(`${localStorage.getItem("sessionToken")}-dailyPlans`)
  );
  console.log(existingPlans);

  outputsGrid.innerHTML = "";

  existingPlans.forEach((plan, i) => {
    // outputsGrid.innerHTML += `
    //     <div class="output-item" pos="${i}">
    //         <div for="output-item item${i}" class="output-time">${plan.date}</div>
    //         <div for="output-item item${i}" class="output-text">${plan.numOfItems} tasks</div>
    //     </div>
    // `;

    if (plan.typeOfOutput == "dailyPlan") {
      outputsGrid.innerHTML += `
        <div class="output-card" data-type="daily">
          <div class="output-header">
            <div class="output-icon daily-icon">
              <i class="fas fa-calendar-day"></i>
            </div>
            <div class="output-info">
              <h3 class="output-title">Daily Plan</h3>
              <p class="output-date">${plan.date}</p>
            </div>
            <div class="output-badge daily-badge">Daily Plan</div>
          </div>
          <div class="output-preview">
            <div class="preview-item">
              <span class="preview-label">Tasks:</span>
              <span class="preview-value">${plan.numOfItems}</span>
            </div>
            <!-- <div class="preview-item">
              <span class="preview-label">Study Hours:</span>
              <span class="preview-value">4h 30m</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">Goals Set:</span>
              <span class="preview-value">5 goals</span>
            </div> -->
          </div>
          <div class="output-actions">
            <button class="view-btn" onclick="viewOutput('daily', ${i})">
              <i class="fas fa-eye"></i> View Details
            </button>
            <button
              class="delete-btn"
              onclick="deleteOutput(${i})"
              aria-label="Delete output"
              title="Delete output"
            >
              <i class="fas fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      `;
    } else if (plan.typeOfOutput == "testReport") {
      outputsGrid.innerHTML += `
        <div class="output-card" data-type="career">
          <div class="output-header">
            <div class="output-icon career-icon">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <div class="output-info">
              <h3 class="output-title">Career Assessment Results</h3>
              <p class="output-date">${plan.date}</p>
            </div>
            <div class="output-badge">Career Test</div>
          </div>
          <div class="output-preview">
            <div class="preview-item">
              <span class="preview-label">Match Score:</span>
              <span class="preview-value">${plan.completion}</span>
            </div>
          </div>
          <div class="output-actions">
            <button class="view-btn" onclick="viewOutput('career', ${i})">
              <i class="fas fa-eye"></i> View Full Results
            </button>
            <button
              class="delete-btn"
              onclick="deleteOutput(${i})"
              aria-label="Delete output"
              title="Delete output"
            >
              <i class="fas fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      `;
    }
  });
}

function viewOutput(type, index) {
  document.body.innerHTML =
    existingPlans[index].testResult || existingPlans[index].plan;
}

function deleteOutput(index) {
  existingPlans.splice(index, 1);
  localStorage.setItem(
    `${localStorage.getItem("sessionToken")}-dailyPlans`,
    JSON.stringify(existingPlans)
  );
  location.reload();
}

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

document.addEventListener("DOMContentLoaded", function () {
  const filterTabs = document.querySelectorAll(".filter-tab");
  const outputCards = document.querySelectorAll(".output-card");
  const emptyState = document.getElementById("emptyState");
  const outputsGrid = document.getElementById("outputsGrid");

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const filter = this.getAttribute("data-filter");

      // Update active tab
      filterTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      // Filter cards
      let visibleCount = 0;
      outputCards.forEach((card) => {
        const cardType = card.getAttribute("data-type");

        if (filter === "all" || cardType === filter) {
          card.classList.remove("hidden");
          card.style.display = "block";
          visibleCount++;
        } else {
          card.classList.add("hidden");
          card.style.display = "none";
        }
      });

      // Show/hide empty state
      if (visibleCount === 0) {
        outputsGrid.style.display = "none";
        emptyState.style.display = "block";
      } else {
        outputsGrid.style.display = "grid";
        emptyState.style.display = "none";
      }
    });
  });
});
