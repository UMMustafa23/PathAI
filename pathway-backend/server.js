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

// CONNECT TO MONGODB
const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db("pathway");
const users = db.collection("users");

// SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password, country, age } = req.body;

    const existing = await users.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

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
      plannerTasks: []
    };

    await users.insertOne(user);

    res.json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await users.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
