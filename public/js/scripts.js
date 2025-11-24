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
  "I reflect deeply on my strengths, weaknesses, and goals."
];

const qContainer = document.getElementById('questions');
questions.forEach((q, i) => {
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="question">${i+1}. ${q}</div>
    <div class="options">
      <div class="opt" style="width:50px;height:50px;"></div>
      <div class="opt" style="width:40px;height:40px;"></div>
      <div class="opt" style="width:30px;height:30px;"></div>
      <div class="opt" style="width:40px;height:40px;"></div>
      <div class="opt" style="width:50px;height:50px;"></div>
    </div>`;
  qContainer.appendChild(div);
});