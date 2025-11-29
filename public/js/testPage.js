if (!localStorage.getItem("sessionToken")) {
  document.location = "/";
}

const socket = new WebSocket(`ws://${location.host}`);

socket.onopen = () => {
  console.log("WebSocket connection established.");
};

// Sidebar toggle functionality
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

    // Close all submenus
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

const questions = [
  "I enjoy solving complex problems even if they take a long time.",
  "I prefer analyzing data before making decisions.",
  "I often come up with creative or unusual solutions.",
  "I like understanding how systems and processes work.",
  "I prefer logical reasoning over intuition when faced with a choice.",
  "I enjoy breaking down large tasks into smaller manageable parts.",
  "I like identifying patterns or trends in information.",
  "I feel energized when working on intellectually challenging tasks.",
  "I find it easy to think several steps ahead.",
  "I enjoy troubleshooting and figuring out why something isn't working.",
  "I tend to question assumptions rather than accept them.",
  "I prefer structured, logical analysis over trial-and-error.",
  "I often generate new ideas spontaneously.",
  "I like improving or optimizing existing systems.",
  "I enjoy tasks that require strategic thinking.",
  "I find it easy to work with many different types of people.",
  "I enjoy helping others solve their problems.",
  "I prefer teamwork over working alone.",
  "I am comfortable speaking in front of groups.",
  "I like explaining ideas in simple, clear ways.",
  "I easily understand what others are feeling.",
  "I prioritize harmony when working with others.",
  "I enjoy persuading or motivating people.",
  "I like mediating conflicts between others.",
  "I prefer collaborative decision-making to independent decisions.",
  "I enjoy teaching or mentoring others.",
  "I find it easy to communicate my thoughts clearly.",
  "I often take the lead in group discussions.",
  "I enjoy working in environments with a lot of social interaction.",
  "I try to adapt my communication style depending on the person.",
];

// Progress tracking
const totalQuestions = 90;
let questionInputs;
let progressBar;
let progressText;
let answeredQuestions = 0;
let answeredQuestionsArr = [];

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  questionInputs = document.querySelectorAll(".question-input");
  progressBar = document.getElementById("progressBar");
  progressText = document.getElementById("progressText");

  // Add change event listeners to all question inputs
  questionInputs.forEach((input) => {
    input.addEventListener("change", updateProgress);
  });

  // Form submission handler
  document.querySelector(".submit-btn").addEventListener("click", handleSubmit);
});

// Update progress bar
function updateProgress() {
  for (let i = 1; i <= totalQuestions; i++) {
    const question = document.querySelector("input[name='q" + i + "']");
    if (question.checked) {
      answeredQuestions++;
      console.log("Answered question " + i + ": " + question.value);

      answeredQuestionsArr.push({
        question: questions[i - 1],
        answer: question.value,
      });
      console.log(answeredQuestionsArr);
    }
  }
  const progress = (answeredQuestions / totalQuestions) * 100;
  progressBar.style.width = progress + "%";
  progressText.textContent = Math.round(progress);
}

// Handle form submission
function handleSubmit(e) {
  e.preventDefault();
  if (answeredQuestions > totalQuestions) {
    alert(
      "Please answer all " + totalQuestions + " questions before submitting."
    );
  } else {
    console.log("Submitting assessment:", answeredQuestionsArr);
    socket.send(`submitAssessment|${JSON.stringify(answeredQuestionsArr)}`);

    document.querySelector(".loading-screen").style.display = "flex";
    document.querySelector(".loading-screen").style.pointerEvents = "all";
    window.scrollTo(0, document.body.scrollHeight);
  }
}

socket.onmessage = (event) => {
  const receivedMsg = JSON.parse(event.data);
  if (receivedMsg.type === "assessmentReport") {
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
        completion: `${(answeredQuestions / totalQuestions) * 100}%`,
        testResult: receivedMsg.data,
        typeOfOutput: "testReport",
      });

      localStorage.setItem(
        `${localStorage.getItem("sessionToken")}-dailyPlans`,
        JSON.stringify(existingPlans)
      );

      document.querySelector(".loading-screen").style.display = "none";
      document.querySelector(".loading-screen").style.pointerEvents = "none";

      document.body.innerHTML = receivedMsg.data;
    } else {
      const newPlans = [];
      newPlans.push({
        date: new Date().toLocaleDateString(),
        completion: `${Math.floor(
          (answeredQuestions / totalQuestions) * 100
        )}%`,
        testResult: receivedMsg.data,
        typeOfOutput: "testReport",
      });

      localStorage.setItem(
        `${localStorage.getItem("sessionToken")}-dailyPlans`,
        JSON.stringify(newPlans)
      );

      document.querySelector(".loading-screen").style.display = "none";
      document.querySelector(".loading-screen").style.pointerEvents = "none";

      document.body.innerHTML = receivedMsg.data;
    }
  }
};
