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

// ==========================================
// 1. AUTHENTICATION
// ==========================================
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

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Check if user exists
    const [users] = await pool.query("SELECT * FROM Users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];

    // 2. Compare password hash (Application Level Security)
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Login successful

    // --- NOTIFICATION CHECK ---
    // Check if user has worked out in the last 3 days
    const [lastWorkout] = await pool.query("SELECT MAX(date) as last_date FROM Workouts WHERE user_id = ?", [user.user_id]);
    const lastDate = lastWorkout[0].last_date ? new Date(lastWorkout[0].last_date) : new Date(0); // Default to old date if no workouts
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    if (lastDate < threeDaysAgo) {
      // Check if we already sent a reminder recently (e.g. today) to avoid spam
      const [recentNotif] = await pool.query(
        "SELECT * FROM Notifications WHERE user_id = ? AND type = 'Reminder' AND created_at > CURDATE()",
        [user.user_id]
      );

      if (recentNotif.length === 0) {
        await pool.query(
          "INSERT INTO Notifications (user_id, type, message, status) VALUES (?, 'Reminder', 'You haven\\'t worked out in a while! Time to get moving!', 'unread')",
          [user.user_id]
        );
      }
    }
    // --------------------------

    res.json({
      message: "Login successful",
      user_id: user.user_id,
      name: user.name,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// ==========================================
// 2. WORKOUTS & LOGS (The Core Loop)
// ==========================================
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

    res.status(200).json(workouts);
  } catch (error) {
    console.error("Fetch Workouts Error:", error);
    res.status(500).json({ message: "Failed to fetch workouts." });
  }
});

app.post("/workouts", async (req, res) => {
  const { user_id, name, type, duration } = req.body;
  try {
    const [resDb] = await pool.query(
      "INSERT INTO Workouts (user_id, name, type, duration, date) VALUES (?, ?, ?, ?, CURDATE())",
      [user_id, name, type, duration]
    );
    res.json({ workout_id: resDb.insertId, message: "Workout Created" });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete("/workouts/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM Workouts WHERE workout_id = ?", [req.params.id]);
    res.json({ message: "Workout deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/workouts/:workoutId/logs", async (req, res) => {
  try {
    const sql = `
            SELECT L.*, E.name as exercise_name 
            FROM Logs L 
            JOIN Exercises E ON L.exercise_id = E.exercise_id 
            WHERE L.workout_id = ?`;
    const [rows] = await pool.query(sql, [req.params.workoutId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/logs", async (req, res) => {
  const { workout_id, exercise_id, sets, reps, weight_used, duration, notes } =
    req.body;
  try {
    await pool.query(
      "INSERT INTO Logs (workout_id, exercise_id, log_date, sets, reps, weight_used, duration, notes) VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?)",
      [workout_id, exercise_id, sets, reps, weight_used, duration, notes]
    );
    res.json({ message: "Log added" });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/exercises", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT exercise_id, name FROM Exercises ORDER BY name"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/categories", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Categories");
    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete("/logs/:logId", async (req, res) => {
  try {
    await pool.query("DELETE FROM Logs WHERE log_id = ?", [req.params.logId]);
    res.json({ message: "Log deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// ==========================================
// 3. GOALS (1:N Relationship)
// ==========================================
app.get("/goals/:userId", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Goals WHERE user_id = ?", [
      req.params.userId,
    ]);
    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/goals", async (req, res) => {
  const { user_id, description, target_date } = req.body;

  if (!description || !description.trim()) {
    return res.status(400).json({ message: "Description is required" });
  }

  try {
    await pool.query(
      'INSERT INTO Goals (user_id, description, target_date, status) VALUES (?, ?, ?, "active")',
      [user_id, description, target_date]
    );
    res.json({ message: "Goal set" });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.put("/goals/:goalId/complete", async (req, res) => {
  try {
    await pool.query(
      'UPDATE Goals SET status = "completed" WHERE goal_id = ?',
      [req.params.goalId]
    );
    res.json({ message: "Goal completed" });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.put("/goals/:goalId/incomplete", async (req, res) => {
  try {
    await pool.query(
      'UPDATE Goals SET status = "active" WHERE goal_id = ?',
      [req.params.goalId]
    );
    res.json({ message: "Goal marked incomplete" });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete("/goals/:goalId", async (req, res) => {
  try {
    await pool.query("DELETE FROM Goals WHERE goal_id = ?", [
      req.params.goalId,
    ]);
    res.json({ message: "Goal deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// ==========================================
// 4. FRIENDSHIPS (N:M Relationship)
// ==========================================
app.get("/friends/:userId", async (req, res) => {
  // Complex query to find friends where user is either sender (user_id) or receiver (user_id_2)
  const sql = `
        SELECT U.user_id, U.name, U.email, F.status 
        FROM Friendship F
        JOIN Users U ON (F.user_id = U.user_id OR F.user_id_2 = U.user_id)
        WHERE (F.user_id = ? OR F.user_id_2 = ?) 
        AND U.user_id != ? 
        AND F.status = 'accepted'`;
  try {
    const [rows] = await pool.query(sql, [
      req.params.userId,
      req.params.userId,
      req.params.userId,
    ]);
    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Search users to add (excluding self and existing friends)
app.get("/users/search", async (req, res) => {
  const { q, userId } = req.query; // Expect userId to exclude
  try {
    // 1. Get list of friend IDs
    const [friends] = await pool.query(
      `SELECT user_id, user_id_2 FROM Friendship 
       WHERE user_id = ? OR user_id_2 = ?`,
      [userId, userId]
    );
    const friendIds = new Set();
    friendIds.add(parseInt(userId)); // Exclude self
    friends.forEach(f => {
      friendIds.add(f.user_id);
      friendIds.add(f.user_id_2);
    });

    const [rows] = await pool.query(
      "SELECT user_id, name, email FROM Users WHERE email LIKE ?",
      [`%${q}%`]
    );

    // Filter out friends in JS (simpler than complex NOT IN query for now)
    const filtered = rows.filter(u => !friendIds.has(u.user_id));

    res.json(filtered);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/friends/requests/:userId", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT F.friendship_id, U.user_id, U.name, U.email 
       FROM Friendship F
       JOIN Users U ON F.user_id = U.user_id
       WHERE F.user_id_2 = ? AND F.status = 'pending'`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/friends/requests/sent/:userId", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT F.friendship_id, U.user_id as friend_id, U.name, U.email 
       FROM Friendship F
       JOIN Users U ON F.user_id_2 = U.user_id
       WHERE F.user_id = ? AND F.status = 'pending'`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/friends/request", async (req, res) => {
  const { user_id, friend_id } = req.body;
  try {
    if (user_id == friend_id)
      return res.status(400).json({ message: "Cannot friend self" });

    // Check if friendship already exists
    const [existing] = await pool.query(
      "SELECT * FROM Friendship WHERE (user_id = ? AND user_id_2 = ?) OR (user_id = ? AND user_id_2 = ?)",
      [user_id, friend_id, friend_id, user_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Friendship already exists or pending" });
    }

    await pool.query(
      'INSERT INTO Friendship (user_id, user_id_2, status) VALUES (?, ?, "pending")',
      [user_id, friend_id]
    );

    // Send notification to the friend
    await pool.query(
      "INSERT INTO Notifications (user_id, type, message, status) VALUES (?, 'Friend Request', 'You have a new friend request!', 'unread')",
      [friend_id]
    );

    res.json({ message: "Request sent" });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete("/notifications/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM Notifications WHERE notification_id = ?", [req.params.id]);
    res.json({ message: "Notification dismissed" });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.put("/friends/:friendshipId/accept", async (req, res) => {
  try {
    await pool.query("UPDATE Friendship SET status = 'accepted' WHERE friendship_id = ?", [req.params.friendshipId]);
    res.json({ message: "Friend request accepted" });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete("/friends/:friendshipId", async (req, res) => {
  try {
    await pool.query("DELETE FROM Friendship WHERE friendship_id = ?", [req.params.friendshipId]);
    res.json({ message: "Friend removed" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Endpoint to remove friend by user_id 
app.delete("/friends/:userId/:friendId", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM Friendship WHERE (user_id = ? AND user_id_2 = ?) OR (user_id = ? AND user_id_2 = ?)",
      [req.params.userId, req.params.friendId, req.params.friendId, req.params.userId]
    );
    res.json({ message: "Friend removed" });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/friends/:friendId/data", async (req, res) => {
  const { viewerId } = req.query;
  const { friendId } = req.params;

  try {
    // 1. Check Privacy Settings
    const [privacyRes] = await pool.query("SELECT * FROM Privacy_Settings WHERE user_id = ?", [friendId]);
    const privacy = privacyRes[0];

    if (!privacy) return res.status(404).json({ message: "User not found" });

    // 2. Check Friendship (unless viewer is self)
    if (viewerId != friendId) {
      if (privacy.profile_visibility === 'private') {
        return res.status(403).json({ message: "Profile is private" });
      }
      // If friends-only, verify friendship
      if (privacy.profile_visibility === 'friends') {
        const [friendship] = await pool.query(
          "SELECT * FROM Friendship WHERE ((user_id = ? AND user_id_2 = ?) OR (user_id = ? AND user_id_2 = ?)) AND status = 'accepted'",
          [viewerId, friendId, friendId, viewerId]
        );
        if (friendship.length === 0) {
          return res.status(403).json({ message: "Not friends" });
        }
      }
    }

    const data = {};

    // 3. Fetch Data based on settings
    if (privacy.share_workouts) {
      const [workouts] = await pool.query("SELECT * FROM Workouts WHERE user_id = ? ORDER BY date DESC LIMIT 5", [friendId]);
      data.workouts = workouts;
    }

    if (privacy.share_goals) {
      const [goals] = await pool.query("SELECT * FROM Goals WHERE user_id = ?", [friendId]);
      data.goals = goals;
    }

    if (privacy.share_progress) {
      const [progress] = await pool.query(`
            SELECT P.* 
            FROM Progress_Tracking P
            JOIN Logs L ON P.log_id = L.log_id
            JOIN Workouts W ON L.workout_id = W.workout_id
            WHERE W.user_id = ?
            ORDER BY P.date DESC LIMIT 5
        `, [friendId]);
      data.progress = progress;
    }

    res.json(data);

  } catch (err) {
    res.status(500).json(err);
  }
});
// ==========================================
// 5. PRIVACY & NOTIFICATIONS
// ==========================================
app.get("/profile/:userId", async (req, res) => {
  try {
    const [privacy] = await pool.query(
      "SELECT * FROM Privacy_Settings WHERE user_id = ?",
      [req.params.userId]
    );
    const [notifs] = await pool.query(
      "SELECT * FROM Notifications WHERE user_id = ? ORDER BY created_at DESC",
      [req.params.userId]
    );
    res.json({ privacy: privacy[0], notifications: notifs });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.put("/profile/:userId/privacy", async (req, res) => {
  const { share_workouts, share_goals, share_progress, profile_visibility } = req.body;
  try {
    await pool.query(
      "UPDATE Privacy_Settings SET share_workouts = ?, share_goals = ?, share_progress = ?, profile_visibility = ? WHERE user_id = ?",
      [share_workouts, share_goals, share_progress, profile_visibility, req.params.userId]
    );
    res.json({ message: "Privacy updated" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// ==========================================
// 6. PROGRESS
// ==========================================
app.get("/logs/:logId/progress", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Progress_Tracking WHERE log_id = ? ORDER BY date DESC", [req.params.logId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/logs/:logId/progress", async (req, res) => {
  const { metric, value, date, notes } = req.body;
  try {
    await pool.query(
      "INSERT INTO Progress_Tracking (log_id, metric, value, date, notes) VALUES (?, ?, ?, ?, ?)",
      [req.params.logId, metric, value, date, notes]
    );
    res.json({ message: "Progress added" });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete("/progress/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM Progress_Tracking WHERE progress_id = ?", [req.params.id]);
    res.json({ message: "Progress deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
