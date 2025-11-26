if (!localStorage.getItem("sessionToken")) {
  document.location = "/";
}

const socket = new WebSocket("ws://localhost:3000");

socket.onopen = () => {
  console.log("WebSocket connection established.");
};

document.querySelector(".past-btn").onclick = () => {
  document.location = "/HTML/pastOutputs.html";
};

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
  "I enjoy troubleshooting and figuring out why something isn’t working.",
  "I tend to question assumptions rather than accept them.",
  "I prefer structured, logical analysis over trial-and-error.",
  "I often generate new ideas spontaneously.",
  "I like improving or optimizing existing systems.",
  "I enjoy tasks that require strategic thinking.",

  // Section B
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

  // Section C
  "I am highly organized in my work.",
  "I prefer planning ahead rather than being spontaneous.",
  "I usually complete tasks before the deadline.",
  "I am comfortable managing multiple tasks at once.",
  "I follow routines effectively.",
  "I like setting goals and working step-by-step toward them.",
  "I keep my workspace tidy and structured.",
  "I rarely procrastinate.",
  "I enjoy detailed tasks that require precision.",
  "I feel stressed when working in chaotic or unpredictable environments.",
  "I prefer clear instructions and expectations.",
  "I often review my work for accuracy.",
  "I like making schedules or to-do lists.",
  "I prefer stable, consistent work rather than sudden changes.",
  "I enjoy long-term projects that require discipline.",

  // Section D
  "I enjoy learning new topics for self-improvement.",
  "I seek careers where I can make a positive impact on society.",
  "I enjoy hands-on work more than theoretical work.",
  "I like technology and working with digital tools.",
  "I enjoy artistic or creative activities.",
  "I prefer working outdoors rather than in an office.",
  "I like tasks that allow me to express my individuality.",
  "I enjoy competitive environments.",
  "I like roles that require leadership or taking charge.",
  "I want a career that offers continuous learning.",
  "I enjoy helping individuals more than working with systems.",
  "I prefer working on projects where I can immediately see results.",
  "I enjoy tasks that involve numbers, data, or analytics.",
  "I prefer careers with flexibility rather than fixed schedules.",
  "I enjoy building or fixing things with my hands.",

  // Section E
  "I prefer a quiet environment for maximum productivity.",
  "I enjoy fast-paced work where decisions need to be made quickly.",
  "I prefer remote or independent work.",
  "I enjoy working in environments full of activity and movement.",
  "I prefer structured corporate environments.",
  "I like working in small teams rather than large organizations.",
  "I enjoy being physically active while working.",
  "I prefer clear rules and procedures to guide my work.",
  "I enjoy environments where I can experiment freely.",
  "I prefer predictable routines over changing tasks.",
  "I like workplaces that encourage creativity and innovation.",
  "I feel comfortable taking on high-pressure tasks.",
  "I enjoy meeting new people regularly as part of work.",
  "I prefer work that allows for travel.",
  "I like having autonomy over my schedule and decisions.",

  // Section F
  "I adapt quickly to unexpected changes.",
  "I stay calm when solving stressful problems.",
  "I enjoy taking calculated risks.",
  "I prefer stability over uncertainty.",
  "I am comfortable making important decisions.",
  "I am naturally curious and love exploring new topics.",
  "I am highly self-motivated without external pressure.",
  "I prefer practical solutions rather than theoretical ones.",
  "I often take initiative without being asked.",
  "I like receiving feedback to improve my work.",
  "I value efficiency and hate wasting time.",
  "I prefer working independently to relying on others.",
  "I like challenging traditional ways of doing things.",
  "I am good at staying focused for long periods.",
  "I reflect deeply on my strengths, weaknesses, and goals.",
];

const qContainer = document.getElementById("questions");
questions.forEach((q, i) => {
  const div = document.createElement("div");
  div.innerHTML = `
    <div class="question">${i + 1}. ${q}</div>
    <div class="options">
      <div class="opt" questionNumber="${i}" reaction="Strongly Agree" style="width:50px;height:50px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M464 256a208 208 0 1 0 -416 0 208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zm372.2 46.3c11.8-3.6 23.7 6.1 19.6 17.8-19.8 55.9-73.1 96-135.8 96-62.7 0-116-40-135.8-95.9-4.1-11.6 7.8-21.4 19.6-17.8 34.7 10.6 74.2 16.5 116.1 16.5 42 0 81.5-6 116.3-16.6zM176 180c-15.5 0-28 12.5-28 28l0 8c0 11-9 20-20 20s-20-9-20-20l0-8c0-37.6 30.4-68 68-68s68 30.4 68 68l0 8c0 11-9 20-20 20s-20-9-20-20l0-8c0-15.5-12.5-28-28-28zm132 28l0 8c0 11-9 20-20 20s-20-9-20-20l0-8c0-37.6 30.4-68 68-68s68 30.4 68 68l0 8c0 11-9 20-20 20s-20-9-20-20l0-8c0-15.5-12.5-28-28-28s-28 12.5-28 28z"/></svg></div>
      <div class="opt" questionNumber="${i}" reaction="Agree" style="width:40px;height:40px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M464 256a208 208 0 1 0 -416 0 208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zm372.2 46.3c11.8-3.6 23.7 6.1 19.6 17.8-19.8 55.9-73.1 96-135.8 96-62.7 0-116-40-135.8-95.9-4.1-11.6 7.8-21.4 19.6-17.8 34.7 10.6 74.2 16.5 116.1 16.5 42 0 81.5-6 116.3-16.6zM144 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg></div>
      <div class="opt" questionNumber="${i}" reaction="Not Sure" style="width:30px;height:30px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M464 256a208 208 0 1 1 -416 0 208 208 0 1 1 416 0zM256 0a256 256 0 1 0 0 512 256 256 0 1 0 0-512zM160 248a24 24 0 1 0 0-48 24 24 0 1 0 0 48zm216-24a24 24 0 1 0 -48 0 24 24 0 1 0 48 0zM192 352c-13.3 0-24 10.7-24 24s10.7 24 24 24l128 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-128 0zM160 176a48 48 0 1 1 0 96 48 48 0 1 1 0-96zm0 128a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm144-80a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm128 0a80 80 0 1 0 -160 0 80 80 0 1 0 160 0z"/></svg></div>
      <div class="opt" questionNumber="${i}" reaction="Disagree" style="width:40px;height:40px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M464 256a208 208 0 1 0 -416 0 208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zM334.7 384.6C319.7 369 293.6 352 256 352s-63.7 17-78.7 32.6c-9.2 9.6-24.4 9.9-33.9 .7s-9.9-24.4-.7-33.9c22.1-23 60-47.4 113.3-47.4s91.2 24.4 113.3 47.4c9.2 9.6 8.9 24.8-.7 33.9s-24.8 8.9-33.9-.7zM144 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg></div>
      <div class="opt" questionNumber="${i}" reaction="Strongly Disagree" style="width:50px;height:50px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm0-144c24.1 0 45.4 11.8 58.5 30 7.7 10.8 22.7 13.2 33.5 5.5s13.2-22.7 5.5-33.5c-21.7-30.2-57.3-50-97.5-50s-75.7 19.8-97.5 50c-7.7 10.8-5.3 25.8 5.5 33.5s25.8 5.3 33.5-5.5c13.1-18.2 34.4-30 58.5-30zm-80-96c17.7 0 32-14.3 32-32l0-.3 9.7 3.2c10.5 3.5 21.8-2.2 25.3-12.6s-2.2-21.8-12.6-25.3l-96-32c-10.5-3.5-21.8 2.2-25.3 12.6s2.2 21.8 12.6 25.3l28.9 9.6c-4.1 5.4-6.6 12.1-6.6 19.4 0 17.7 14.3 32 32 32zm192-32c0-7.3-2.4-14-6.6-19.4l28.9-9.6c10.5-3.5 16.1-14.8 12.6-25.3s-14.8-16.1-25.3-12.6l-96 32c-10.5 3.5-16.1 14.8-12.6 25.3s14.8 16.1 25.3 12.6l9.7-3.2 0 .3c0 17.7 14.3 32 32 32s32-14.3 32-32z"/></svg></div>
    </div>`;
  qContainer.appendChild(div);
});

let answersArr = [];

const opts = document.querySelectorAll(".opt");
opts.forEach((opt) => {
  opt.onclick = () => {
    const qNum = opt.getAttribute("questionNumber");
    const reaction = opt.getAttribute("reaction");

    answersArr.push({ question: questions[qNum], reaction: reaction });
    console.log(answersArr);
  };
});

document.querySelector(".submit-btn").onclick = () => {
  // if (answersArr.length <= questions.length) {
  socket.send(`submitAssessment|${JSON.stringify(answersArr)}`);
};

socket.onmessage = (event) => {
  const receivedMsg = JSON.parse(event.data);
  if (receivedMsg.type === "assessmentReport") {
    qContainer.innerHTML = `<h2>Assessment Report</h2><pre>${receivedMsg.data}</pre>`;
  }
};

document.querySelector(".circle-btn").onclick = () => {
  localStorage.removeItem("sessionToken");
  window.location = "/";
};
