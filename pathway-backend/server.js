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

    app.post("/signup", async (req, res) => {
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
        };

        await users.insertOne(user);

        res.json({ message: "User created successfully", user });
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

    app.get("/questions", async (req, res) => {
      try {
        const questions = await db
          .collection("questions")
          .find()
          .sort({ id: 1 })
          .toArray();

        res.json({ questions });
      } catch (err) {
        res.status(500).json({ error: "Failed to load questions" });
      }
    });
    app.post("/scoreAssessment", async (req, res) => {
      try {
        const { answers } = req.body;

        const traits = {
          Extraversion: 0,
          Agreeableness: 0,
          Conscientiousness: 0,
          Neuroticism: 0,
          Openness: 0,
        };

        const questions = await db.collection("questions").find().toArray();

        questions.forEach((q, i) => {
          const value = answers[i];

          if (q.reverse) {
            traits[q.trait] += 6 - value;
          } else {
            traits[q.trait] += value;
          }
        });

        res.json({ traits });
      } catch (err) {
        console.error("Scoring error:", err);
        res.status(500).json({ error: "Scoring failed" });
      }
    });

    app.post("/saveResults", async (req, res) => {
      try {
        const { email, traits } = req.body;

        console.log("Saving results for:", email);
        
        await db.collection("results").updateOne(
          { email },
          { $set: { traits, updatedAt: new Date() } },
          { upsert: true }
        );

        await users.updateOne(
          { email },
          { $set: { assessmentCompleted: true } }
        );

        res.json({ success: true });
      } catch (err) {
        console.error("Save results error:", err);
        res.status(500).json({ error: "Failed to save results" });
      }
      

    });
    app.get("/getResults", async (req, res) => {
      try {
        const email = req.query.email;

        const result = await db.collection("results").findOne({ email });

        res.json({ traits: result?.traits || null });
      } catch (err) {
        console.error("Get results error:", err);
        res.status(500).json({ error: "Failed to load results" });
      }
    });

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
