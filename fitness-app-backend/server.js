const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.HOST,
  port: process.env.PORT,
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
};

const pool = mysql.createPool(dbConfig);

/**
 * FUNCTIONALITY 1: New User Registration
 * This endpoint receives user details, hashes the password, and calls the
 * sp_RegisterUser stored procedure using a prepared statement.
 */
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: "All fields are required." });
    return;
  }

  try {
    // 1. Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Call the stored procedure using a prepared statement to prevent SQL injection
    await pool.query("CALL sp_RegisterUser(?, ?, ?)", [
      name,
      email,
      hashedPassword,
    ]);

    console.log(`User registered successfully: ${email}`);
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Registration Error:", error);
    // Handle potential duplicate email error from the database
    if (error.code === "ER_DUP_ENTRY") {
      res.status(409).json({ message: "Email already exists." });
      return;
    }
    res.status(500).json({ message: "An error occurred during registration." });
  }
});

/**
 * FUNCTIONALITY 2: View Recent Workouts
 * This endpoint fetches the 5 most recent workouts for a given user ID.
 * It uses a prepared statement to ensure the userId is handled safely.
 */
app.get("/workouts/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
            SELECT workout_id, name, type, duration, date 
            FROM Workouts 
            WHERE user_id = ? 
            ORDER BY date DESC 
            LIMIT 5;
        `;

    // Use a prepared statement to prevent SQL injection
    const [workouts] = await pool.query(query, [userId]);
    console.log(workouts);
    res.status(200).json(workouts);
  } catch (error) {
    console.error("Fetch Workouts Error:", error);
    res.status(500).json({ message: "Failed to fetch workouts." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
