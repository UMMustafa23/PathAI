import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);

async function startServer() {
  try {
    await client.connect();
    console.log("MongoDB connected");

    const db = client.db("pathway");
    const users = db.collection("users");
    const assessments = db.collection("assessments");

    app.post("/signup", async (req, res) => {
      console.log("SIGNUP HIT");
      try {
        const { username, email, password, country, age } = req.body;

        if (!username || !email || !password) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        const existing = await users.findOne({ email });
        if (existing) {
          return res.status(400).json({ error: "Email already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = {
          username,
          email,
          password: hashed,
          country,
          age,
          createdAt: new Date(),
          assessmentCompleted: false,
          interestsHistory: [],
          plannerTasks: [],
        };

        await users.insertOne(user);

        res.json({ message: "User created successfully" });
      } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: "Signup failed" });
      }
    });

    app.post("/login", async (req, res) => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({ error: "Missing email or password" });
        }

        const user = await users.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: "Wrong password" });

        const token = jwt.sign(
          { email },
          process.env.JWT_SECRET || "dev_secret",
          { expiresIn: "7d" }
        );

        res.json({ token, user });
      } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Login failed" });
      }
    });

    app.post("/saveAssessment", async (req, res) => {
      try {
        const { email, answers, score } = req.body;

        if (!email || !answers) {
          return res.status(400).json({ error: "Missing data" });
        }

        const assessment = {
          email,
          answers,
          score,
          createdAt: new Date(),
        };

        await assessments.insertOne(assessment);

        res.json({ message: "Assessment saved successfully" });
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to save assessment" });
      }
    });

    app.get("/getProfile", async (req, res) => {
      try {
        const email = req.query.email;
        if (!email) return res.status(400).json({ error: "Missing email" });

        const user = await users.findOne({ email });
        const userAssessments = await assessments
          .find({ email })
          .sort({ createdAt: -1 })
          .toArray();

        res.json({
          user,
          assessments: userAssessments,
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch profile" });
      }
    });

    app.post("/updateProfile", async (req, res) => {
      try {
        const { email, updates } = req.body;
        if (!email || !updates) {
          return res.status(400).json({ error: "Missing data" });
        }

        await users.updateOne({ email }, { $set: updates });
        const updatedUser = await users.findOne({ email });

        res.json({ message: "Profile updated", user: updatedUser });
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to update profile" });
      }
    });

    // START SERVER
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

startServer();
