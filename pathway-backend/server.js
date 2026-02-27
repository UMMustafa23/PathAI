import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

const client = new MongoClient(process.env.MONGO_URI);

// ================= AUTH MIDDLEWARE =================
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev_secret"
    );

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ================= START SERVER =================
async function startServer() {
  try {
    await client.connect();
    console.log("✅ MongoDB connected");

    const db = client.db("pathway");
    const users = db.collection("users");
    const questionsCollection = db.collection("questions");

    // ================= SIGNUP =================
    app.post("/signup", async (req, res) => {
      try {
        const { username, email, password, country, age, gender } = req.body;

        if (!username || !email || !password) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        const existing = await users.findOne({ email });
        if (existing) {
          return res.status(400).json({ error: "Email already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);

        await users.insertOne({
          username,
          email,
          password: hashed,
          country: country || null,
          age: age || null,
          gender: gender || null,
          createdAt: new Date(),
          assessmentCompleted: false,
        });

        res.json({ message: "User created successfully" });
      } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: "Signup failed" });
      }
    });

    // ================= LOGIN =================
    app.post("/login", async (req, res) => {
      try {
        const { email, password } = req.body;

        const user = await users.findOne({ email });
        if (!user) {
          return res.status(400).json({ error: "User not found" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return res.status(400).json({ error: "Wrong password" });
        }

        const token = jwt.sign(
          { email: user.email },
          process.env.JWT_SECRET || "dev_secret",
          { expiresIn: "7d" }
        );

        const { password: _, ...safeUser } = user;

        res.json({ token, user: safeUser });
      } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Login failed" });
      }
    });

    // ================= GET QUESTIONS =================
    app.get("/questions", authenticate, async (req, res) => {
      try {
        const questions = await questionsCollection.find({}).toArray();
        res.json(questions);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch questions" });
      }
    });

    // ================= SAVE ASSESSMENT + AI =================
    app.post("/assessment", authenticate, async (req, res) => {
      try {
        const { answers } = req.body;

        if (!answers) {
          return res.status(400).json({ error: "No answers provided" });
        }

        if (!process.env.DEEPSEEK_API_KEY) {
          return res.status(500).json({ error: "DeepSeek API key missing" });
        }

        const prompt = `
Return ONLY valid raw JSON.
Do NOT include markdown or explanation.

Based on these assessment answers:
${JSON.stringify(answers)}

Return:
{
  "summary": "text",
  "tags": ["tag1","tag2"],
  "careers": [
    { "title": "Career Name", "match": "95%" }
  ],
  "universities": [
    { "name": "University Name", "location": "Country" }
  ]
}
`;

        const aiResponse = await axios.post(
          "https://api.deepseek.com/v1/chat/completions",
          {
            model: "deepseek-chat",
            messages: [{ role: "user", content: prompt }],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
              "Content-Type": "application/json",
            },
            timeout: 20000,
          }
        );

        const aiContent = aiResponse.data.choices[0].message.content;

        let cleaned = aiContent
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        const match = cleaned.match(/\{[\s\S]*\}/);

        if (!match) {
          console.error("AI RAW RESPONSE:", aiContent);
          return res.status(500).json({ error: "AI returned invalid format" });
        }

        let parsed = JSON.parse(match[0]);

        await users.updateOne(
          { email: req.user.email },
          {
            $set: {
              assessmentAnswers: answers,
              assessmentCompleted: true,
              assessmentDate: new Date(),
              assessmentResult: parsed,
            },
          }
        );

        console.log("✅ Assessment saved for:", req.user.email);

        // 🔥 THIS WAS MISSING BEFORE
        res.json(parsed);

      } catch (err) {
        console.error("Assessment error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to process assessment" });
      }
    });

    // ================= GET RESULTS =================
    app.get("/results", authenticate, async (req, res) => {
      try {
        const user = await users.findOne({ email: req.user.email });

        if (!user || !user.assessmentResult) {
          return res.status(404).json({ error: "No results found" });
        }

        res.json(user.assessmentResult);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch results" });
      }
    });

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
}

startServer();