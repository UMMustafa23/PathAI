const express = require("express");
const app = express();
const server = require("http").createServer(app);
const path = require("path");
const WebSocket = require("ws");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const satelize = require("satelize");
const requestIp = require("request-ip");
const User = require("./models/User.model");
const OpenAI = require("openai");
const env = require("dotenv").config();

mongoose
  .connect(process.env.DB_CONNECTION_STRING)
  .then(console.log("Connected to mongoDB"));

app.use(express.static(path.join(__dirname, "public")));
const wss = new WebSocket.Server({ server: server });

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

wss.on("connection", (ws) => {
  ws.on("close", () => {
    //...remove client from clients array on disconnect
  });

  ws.on("message", async (message) => {
    const msgToArr = new String(message).split("|");

    if (msgToArr[0] === "messageAiAssistant") {
      const completion = await openai.chat.completions.create({
        messages: JSON.parse(msgToArr[1]),
        model: "deepseek-chat",
      });

      ws.send(
        JSON.stringify({
          type: "aiAssistantResponse",
          data: completion.choices[0].message.content,
        })
      );
    } else if (msgToArr[0] === "submitAssessment") {
      const assessmentResults = JSON.parse(msgToArr[1]);
      const messageToAi = `Analyze the following assessment results and 
      provide a detailed report on the user's personality traits, 
      strengths, weaknesses, and suitable career paths based on their answers: ${JSON.stringify(
        assessmentResults
      )}. Please write your answer in the form of an html document 
      using the following structure WITHOUT adding ANY styling and CSS, that will be handled separately:
        <h1 class="main-heading">Your Career Assessment Results</h1>

        <!-- Personal Analysis Section -->
        <section class="analysis-section">
            <div class="personality-card">
                <h2 class="card-heading">Analytical Thinker</h2>
                <p class="card-subtext">You excel at breaking down complex problems, identifying patterns, and making data-driven decisions. Your logical approach helps you solve challenges systematically.</p>
                <div class="qualities-container">
                    <span class="quality-tag">Problem Solving</span>
                    <span class="quality-tag">Critical Thinking</span>
                    <span class="quality-tag">Data Analysis</span>
                    <span class="quality-tag">Strategic Planning</span>
                </div>
            </div>

            <div class="personality-card">
                <h2 class="card-heading">Creative Innovator</h2>
                <p class="card-subtext">Your ability to think outside the box and generate unique solutions sets you apart. You thrive in environments that encourage experimentation and creative expression.</p>
                <div class="qualities-container">
                    <span class="quality-tag">Innovation</span>
                    <span class="quality-tag">Creativity</span>
                    <span class="quality-tag">Adaptability</span>
                    <span class="quality-tag">Vision</span>
                </div>
            </div>

            <div class="personality-card">
                <h2 class="card-heading">Team Collaborator</h2>
                <p class="card-subtext">You work exceptionally well with others, understanding different perspectives and facilitating productive group dynamics. Your communication skills enhance team performance.</p>
                <div class="qualities-container">
                    <span class="quality-tag">Communication</span>
                    <span class="quality-tag">Empathy</span>
                    <span class="quality-tag">Leadership</span>
                    <span class="quality-tag">Cooperation</span>
                </div>
            </div>
        </section>

        <!-- Recommended Careers Section -->
        <section class="careers-section">
            <h2 class="section-heading">Recommended Careers</h2>
            
            <div class="career-card">
                <div class="match-badge">94%</div>
                <h3 class="career-title">Software Engineer</h3>
                <p class="career-stats">$120,000/year • 22% growth</p>
                <p class="career-description">Design, develop, and maintain software applications. Work with cutting-edge technologies to solve real-world problems through code.</p>
            </div>

            <div class="career-card">
                <div class="match-badge">89%</div>
                <h3 class="career-title">Data Scientist</h3>
                <p class="career-stats">$115,000/year • 35% growth</p>
                <p class="career-description">Analyze complex data sets to extract meaningful insights. Use statistical methods and machine learning to drive business decisions.</p>
            </div>

            <div class="career-card">
                <div class="match-badge">86%</div>
                <h3 class="career-title">UX Designer</h3>
                <p class="career-stats">$95,000/year • 18% growth</p>
                <p class="career-description">Create intuitive and engaging user experiences for digital products. Combine creativity with user research to design effective interfaces.</p>
            </div>
        </section>

        <!-- Top University Programs Section -->
        <section class="university-section">
            <h2 class="section-heading">Top University Programs</h2>
            
            <div class="university-grid">
                <div class="university-card">
                    <h3 class="university-title">MIT - Computer Science</h3>
                    <p class="university-majors">Software Engineering, AI & Machine Learning, Cybersecurity</p>
                    <div class="university-info">
                        <div class="info-row">
                            <span class="info-label">Acceptance Rate:</span>
                            <span class="info-value">7%</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Annual Tuition:</span>
                            <span class="info-value">$55,450</span>
                        </div>
                    </div>
                </div>

                <div class="university-card">
                    <h3 class="university-title">Stanford - Engineering</h3>
                    <p class="university-majors">Computer Science, Data Science, Electrical Engineering</p>
                    <div class="university-info">
                        <div class="info-row">
                            <span class="info-label">Acceptance Rate:</span>
                            <span class="info-value">5%</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Annual Tuition:</span>
                            <span class="info-value">$57,693</span>
                        </div>
                    </div>
                </div>

                <div class="university-card">
                    <h3 class="university-title">Carnegie Mellon - SCS</h3>
                    <p class="university-majors">Software Engineering, Robotics, Human-Computer Interaction</p>
                    <div class="university-info">
                        <div class="info-row">
                            <span class="info-label">Acceptance Rate:</span>
                            <span class="info-value">15%</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Annual Tuition:</span>
                            <span class="info-value">$59,864</span>
                        </div>
                    </div>
                </div>

                <div class="university-card">
                    <h3 class="university-title">UC Berkeley - EECS</h3>
                    <p class="university-majors">Computer Science, Data Science, Electrical Engineering</p>
                    <div class="university-info">
                        <div class="info-row">
                            <span class="info-label">Acceptance Rate:</span>
                            <span class="info-value">17%</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Annual Tuition:</span>
                            <span class="info-value">$44,007</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Personalized Study Plan Section -->
        <section class="study-plan-section">
            <h2 class="section-heading">Personalized Study Plan</h2>
            
            <div class="study-plan-container">
                <div class="study-resource-card">
                    <div class="resource-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="resource-content">
                        <h4 class="resource-title">Introduction to Computer Science</h4>
                        <p class="resource-description">Start with Python fundamentals and basic algorithms</p>
                        <a href="#" class="resource-link">View Course <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>

                <div class="study-resource-card">
                    <div class="resource-icon">
                        <i class="fas fa-laptop-code"></i>
                    </div>
                    <div class="resource-content">
                        <h4 class="resource-title">Data Structures & Algorithms</h4>
                        <p class="resource-description">Master essential problem-solving techniques</p>
                        <a href="#" class="resource-link">View Course <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>

                <div class="study-resource-card">
                    <div class="resource-icon">
                        <i class="fas fa-database"></i>
                    </div>
                    <div class="resource-content">
                        <h4 class="resource-title">Database Management</h4>
                        <p class="resource-description">Learn SQL and database design principles</p>
                        <a href="#" class="resource-link">View Course <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>

                <div class="study-resource-card">
                    <div class="resource-icon">
                        <i class="fas fa-code-branch"></i>
                    </div>
                    <div class="resource-content">
                        <h4 class="resource-title">Software Engineering Practices</h4>
                        <p class="resource-description">Version control, testing, and project management</p>
                        <a href="#" class="resource-link">View Course <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>

                <div class="study-resource-card">
                    <div class="resource-icon">
                        <i class="fas fa-brain"></i>
                    </div>
                    <div class="resource-content">
                        <h4 class="resource-title">Machine Learning Basics</h4>
                        <p class="resource-description">Introduction to AI and ML concepts</p>
                        <a href="#" class="resource-link">View Course <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>

                <div class="study-resource-card">
                    <div class="resource-icon">
                        <i class="fas fa-globe"></i>
                    </div>
                    <div class="resource-content">
                        <h4 class="resource-title">Web Development</h4>
                        <p class="resource-description">HTML, CSS, JavaScript, and modern frameworks</p>
                        <a href="#" class="resource-link">View Course <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>
            </div>
        </section>

        Fill in any of the shown information in the html structure above with your 
        own research based on the assessment results provided. From you I require 
        ONLY the html document as per the structure shown above WITHOUT ANY CSS or STYLING! 
        And do NOT change any classes, ids, names or any part of the structure shown above. 
        Only fill in the content appropriately.
      `;

      // Please structure the report in clear sections with headings
      // for each aspect analyzed. Give me a personality type, recommended
      // carrers, university program suggestions and a personalised study plan.
      //Ensure that the headings and paragraphs are wrapped in <h2> and <p> HTML tags respectively.
      // It is important that you ONLY use the information provided in the assessment results
      // to generate the report and do NOT make any assumptions or add any information that is not
      // explicitly mentioned in the results.

      const completionForReport = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful career assessment assistant. Follow directions carefully and exactly as presented to you.",
          },
          { role: "user", content: messageToAi },
        ],
        model: "deepseek-chat",
      });

      ws.send(
        JSON.stringify({
          type: "assessmentReport",
          data: completionForReport.choices[0].message.content,
        })
      );
    } else if (msgToArr[0] === "generate-daily-plan") {
      const tasks = JSON.parse(msgToArr[1]);
      const messageToAi = `Create a detailed daily plan for tomorrow based on the following tasks: ${tasks.join(
        ", "
      )}. Please keep in mind that the user is sending a list of tasks he is planning on doing the next day
      and is just asking you to turn his boring list of tasks into a good looking better plan which you can 
      make by allocating specific time slots for each task and ensure a balanced distribution of activities 
      throughout the day. Include breaks and leisure time as well. Do NOT add any extra tasks that are not mentioned. 
      Also, could you ensure that every heading and paragraph are wrapped in <h2> and <p> HTML tags respectively.`;

      const completionForDailyPlan = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful to do list planner. Follow directions carefully and exactly as presented to you.",
          },
          { role: "user", content: messageToAi },
        ],
        model: "deepseek-chat",
      });

      ws.send(
        JSON.stringify({
          type: "dailyPlan",
          data: completionForDailyPlan.choices[0].message.content,
        })
      );
    }
  });
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: "urlshrnk@gmail.com",
    pass: "tvgkwogoyhhiqlzb",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/HTML/logIn.html"));
});

app.get("/createAccount", (req, res) => {
  const userData = JSON.parse(atob(req.query.userData));

  try {
    const hashedPassword = bcrypt.hashSync(userData.password, 10);

    const sessionTokenOrigin = `${userData.username}@${hashedPassword}`;
    const sessionToken = bcrypt.hashSync(sessionTokenOrigin, 10);
    const base64SessionToken = btoa(sessionToken);

    let clientLocation;

    satelize.satelize({ ip: requestIp.getClientIp(req) }, function (err, data) {
      if (err) {
        console.error(`There has been an error: ${err}`);
      } else {
        try {
          clientLocation =
            `${data.continent.en}/${data.country.en}/${
              data.timezone.split("/")[1]
            }` || "Unknown/Unknown/Unknown";
        } catch (error) {
          clientLocation = "Uknown/Unknown/Unknown";
        }
      }
    });

    const user = new User({
      username: userData.username,
      email: userData.email,
      age: userData.age,
      grade: userData.grade,
      gender: userData.gender,
      major: userData.major,
      eduInst: userData.eduInst,
      password: hashedPassword,
      sessionToken: sessionToken,
      ip_encrypted: bcrypt.hashSync(requestIp.getClientIp(req), 10),
      location: clientLocation,
      region: userData.region,
    });

    user.save().then((response) => {
      transporter.sendMail({
        to: user.email,
        subject: `Confirm your email.`,
        html: `<h1>Hello, ${user.username}</h1> <br />
                <p>This is an automated confirmation email. Please click <a href="${
                  process.env.WEBSITE_URL
                }/confirmEmail?token=${btoa(
          user.sessionToken
        )}">here</a> to confirm your email.</p>`,
      });

      res.send({
        payload: true,
        sessionToken: base64SessionToken,
      });
    });
  } catch (error) {
    console.error("Something went wrong:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/checkUsernameAvailability", (req, res) => {
  try {
    User.findOne({ username: req.query.username }).then((user) => {
      if (user) {
        res.send({ payload: false });
      } else {
        res.send({ payload: true });
      }
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/checkEmailAvailability", (req, res) => {
  try {
    User.findOne({ email: req.query.email }).then((user) => {
      if (user) {
        res.send({ payload: false });
      } else {
        res.send({ payload: true });
      }
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/logintoAccount", (req, res) => {
  try {
    const userData = JSON.parse(atob(req.query.userData));

    User.findOne({ email: userData.email }).then((user) => {
      if (user) {
        const passwordMatch = bcrypt.compareSync(
          userData.password,
          user.password
        );

        if (passwordMatch) {
          res.send({
            payload: true,
            sessionToken: btoa(user.sessionToken),
          });
        } else {
          res.send({ payload: false });
        }
      } else {
        res.send({ payload: false });
      }
    });
  } catch (error) {
    res.statusCode(500).send("Internal Server Error");
  }
});

app.get("/getUserInfo", (req, res) => {
  User.findOne({
    sessionToken: atob(req.query.token),
  }).then((user) => {
    if (user) {
      res.send({
        payload: user,
      });
    } else {
      res.send({ payload: false });
    }
  });
});

app.get("/confirmEmail", (req, res) => {
  const sessionToken = atob(req.query.token);

  User.updateOne({ sessionToken: sessionToken }, { verifiedEmail: true }).then(
    (response) => {
      if (response.modifiedCount > 0) {
        res.sendFile(path.join(__dirname + "/public/main_pages/home.html"));
      } else {
        res.status(404);
        res.send("<h1>Error 404: This link has expired.</h1>");
      }
    }
  );
});

app.use((req, res) => {
  res.status(404);
  res.send("<h1>Error 404: Resource not found.</h1>");
});

server.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
