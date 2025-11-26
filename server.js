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

app.use("/", express.static(path.join(__dirname, "public")));
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
      const messageToAi = `Analyze the following assessment results and provide a detailed report on the user's personality traits, strengths, weaknesses, and suitable career paths based on their answers: ${JSON.stringify(
        assessmentResults
      )}. Please structure the report in clear sections with headings for each aspect analyzed. Give me a personality type, recommended carrers, university program suggestions and a personalised study plan.`;

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
      throughout the day. Include breaks and leisure time as well. Do NOT add any extra tasks that are not mentioned`;

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
