import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
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

// ================= MONGOOSE SCHEMAS =================
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  country: { type: String, default: null },
  age: { type: Number, default: null },
  gender: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  assessmentCompleted: { type: Boolean, default: false },
  assessmentAnswers: { type: mongoose.Schema.Types.Mixed, default: null },
  assessmentDate: { type: Date, default: null },
  assessmentResult: { type: mongoose.Schema.Types.Mixed, default: null },
  bigFiveScores: { type: mongoose.Schema.Types.Mixed, default: null },
  selectedCareer: { type: mongoose.Schema.Types.Mixed, default: null },
  selectedUniversity: { type: mongoose.Schema.Types.Mixed, default: null },
});

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  domain:   { type: String, default: null },
  options:  { type: [String], default: [] },
});

const User = mongoose.model("User", userSchema);
const Question = mongoose.model("Question", questionSchema);

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
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // ================= SIGNUP =================
    app.post("/signup", async (req, res) => {
      try {
        const { username, email, password, country, age, gender } = req.body;

        if (!username || !email || !password) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        const existing = await User.findOne({ email });
        if (existing) {
          return res.status(400).json({ error: "Email already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);

        await User.create({
          username,
          email,
          password: hashed,
          country: country || null,
          age: age || null,
          gender: gender || null,
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

        const user = await User.findOne({ email });
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

        const { password: _, ...safeUser } = user.toObject();

        res.json({ token, user: safeUser });
      } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Login failed" });
      }
    });

    // ================= GET QUESTIONS =================
    app.get("/questions", authenticate, async (req, res) => {
      try {
        const questions = await Question.find({});
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

        // Compute Big Five scores server-side using domain info from DB
        const allQuestions = await Question.find({}, "_id domain");
        const buckets = { E: [], A: [], C: [], N: [], O: [] };
        allQuestions.forEach((q) => {
          const score = answers[q._id.toString()];
          if (score !== undefined && buckets[q.domain]) {
            buckets[q.domain].push(Number(score));
          }
        });
        const avg = (arr) =>
          arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;
        const bigFive = {
          extraversion:      avg(buckets.E),
          agreeableness:     avg(buckets.A),
          conscientiousness: avg(buckets.C),
          neuroticism:       avg(buckets.N),
          openness:          avg(buckets.O),
        };

        // Get user's country for localized university recommendations
        const userDoc = await User.findOne({ email: req.user.email }, "country");
        const userCountry = userDoc?.country || "Unknown";

        const prompt = `
Return ONLY valid raw JSON. Do NOT include markdown or explanation.

A student completed a 90-item IPIP Big Five personality assessment (scale 1–5, 1 = low, 5 = high).
Computed Big Five domain averages:
- Extraversion:       ${bigFive.extraversion}
- Agreeableness:      ${bigFive.agreeableness}
- Conscientiousness:  ${bigFive.conscientiousness}
- Neuroticism:        ${bigFive.neuroticism} (lower = more emotionally stable)
- Openness:           ${bigFive.openness}

The student's country is: ${userCountry}

Based on this personality profile:
1. Recommend exactly 6 careers ranked by match percentage.
2. Recommend exactly 6 universities: 3 located IN ${userCountry} (mark local: true) and 3 international (mark local: false), all relevant to the top careers.

Return ONLY this exact JSON structure, with no extra keys:
{
  "summary": "2-3 sentence personality summary tailored to career guidance",
  "tags": ["3 to 5 short personality trait labels"],
  "careers": [
    {
      "title": "Career Title",
      "match": "XX%",
      "averagePay": "$XX,XXX/yr (use the currency of ${userCountry})",
      "description": "One concise sentence describing the career."
    }
  ],
  "universities": [
    {
      "name": "University Name",
      "location": "City, Country",
      "tuition": "$XX,XXX/yr (use the currency of ${userCountry} for local ones)",
      "major": "Recommended Major",
      "acceptanceRate": "XX%",
      "match": "XX%",
      "local": true
    }
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
            timeout: 60000,
          }
        );

        const aiContent = aiResponse.data.choices[0].message.content;
        console.log("AI RAW:", aiContent.slice(0, 300));

        let cleaned = aiContent
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();

        // Grab the outermost JSON object
        const firstBrace = cleaned.indexOf("{");
        const lastBrace = cleaned.lastIndexOf("}");
        if (firstBrace === -1 || lastBrace === -1) {
          console.error("AI RAW RESPONSE (no JSON):", aiContent);
          return res.status(500).json({ error: "AI returned invalid format", raw: aiContent.slice(0, 500) });
        }
        const jsonStr = cleaned.slice(firstBrace, lastBrace + 1);

        let parsed;
        try {
          parsed = JSON.parse(jsonStr);
        } catch (parseErr) {
          console.error("JSON parse error:", parseErr.message);
          console.error("JSON string:", jsonStr.slice(0, 500));
          return res.status(500).json({ error: "AI response JSON parse failed", detail: parseErr.message });
        }

        await User.updateOne(
          { email: req.user.email },
          {
            $set: {
              assessmentAnswers: answers,
              assessmentCompleted: true,
              assessmentDate: new Date(),
              assessmentResult: parsed,
              bigFiveScores: bigFive,
            },
          }
        );

        console.log("✅ Assessment saved for:", req.user.email);

        // 🔥 THIS WAS MISSING BEFORE
        res.json(parsed);

      } catch (err) {
        const detail = err.response?.data || err.message;
        console.error("Assessment error:", detail);
        res.status(500).json({ error: "Failed to process assessment", detail: String(detail) });
      }
    });

    // ================= SAVE SELECTION =================
    app.post("/save-selection", authenticate, async (req, res) => {
      try {
        const { type, item } = req.body;
        if (!type || !item) {
          return res.status(400).json({ error: "Missing type or item" });
        }
        if (type !== "career" && type !== "university") {
          return res.status(400).json({ error: "type must be 'career' or 'university'" });
        }

        const field = type === "career" ? "selectedCareer" : "selectedUniversity";
        await User.updateOne(
          { email: req.user.email },
          { $set: { [field]: item } }
        );

        // Return updated user so the app can refresh AsyncStorage
        const updated = await User.findOne({ email: req.user.email }).select("-password");
        res.json({ message: "Saved", user: updated });
      } catch (err) {
        console.error("Save selection error:", err.message);
        res.status(500).json({ error: "Failed to save selection" });
      }
    });

    // ================= GET RESULTS =================
    app.get("/results", authenticate, async (req, res) => {
      try {
        const user = await User.findOne({ email: req.user.email });

        if (!user || !user.assessmentResult) {
          return res.status(404).json({ error: "No results found" });
        }

        res.json({
          ...user.assessmentResult,
          selectedCareer: user.selectedCareer || null,
          selectedUniversity: user.selectedUniversity || null,
        });
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