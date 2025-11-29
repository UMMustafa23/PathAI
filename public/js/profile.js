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

// Profile functionality
document.addEventListener("DOMContentLoaded", function () {
  // Edit name functionality
  const editNameBtn = document.querySelector(".edit-icon-btn");
  const userName = document.getElementById("userName");

  if (editNameBtn) {
    editNameBtn.addEventListener("click", function () {
      const currentName = userName.textContent;
      const newName = prompt("Enter your name:", currentName);
      if (newName && newName.trim()) {
        userName.textContent = newName.trim();
      }
    });
  }

  // Edit picture functionality
  const editPictureBtn = document.querySelector(".edit-picture-btn");

  if (editPictureBtn) {
    editPictureBtn.addEventListener("click", function () {
      alert("Picture upload functionality would be implemented here");
    });
  }

  // Continue study plan button
  const continueBtn = document.querySelector(".continue-btn");

  if (continueBtn) {
    continueBtn.addEventListener("click", function () {
      window.location.href = "dailyPlan.html";
    });
  }

  // Settings items
  const settingItems = document.querySelectorAll(".setting-item");

  settingItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const settingName = this.querySelector("span").textContent;

      if (settingName === "Log Out") {
        if (confirm("Are you sure you want to log out?")) {
          localStorage.removeItem("sessionToken");
          window.location = "/";
        }
      }
    });
  });

  // Achievement badges interaction
  const achievementBadges = document.querySelectorAll(
    ".achievement-badge:not(.locked)"
  );

  achievementBadges.forEach((badge) => {
    badge.addEventListener("click", function () {
      const badgeName = this.querySelector(".badge-name").textContent;
      const badgeDesc = this.querySelector(".badge-desc").textContent;
      alert(`Achievement: ${badgeName}\n${badgeDesc}`);
    });
  });

  // Animate progress bar on load
  setTimeout(() => {
    const progressBar = document.querySelector(".progress-bar-fill");
    if (progressBar) {
      progressBar.style.transition = "width 1.5s ease";
    }
  }, 100);

  // Edit goals button
  const editGoalsBtn = document.querySelector(".section-container .edit-btn");

  if (editGoalsBtn) {
    editGoalsBtn.addEventListener("click", function () {
      alert("Goal editing interface would be implemented here");
    });
  }
});
