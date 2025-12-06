# Fitness App Project

**CS 4750 Database Systems Project**

**Team Members:**
* Michael He (rue5vw)
* Pele Boupha (qtc8dt)

## Project Overview

This is a full-stack mobile fitness application designed to help users track their workouts, set fitness goals, manage progress, and connect with friends. The app provides a seamless experience for logging exercises, visualizing progress, and staying motivated through social features.

## Key Features

### 1. User Authentication
* Secure registration and login functionality.
* Personalized user profiles with privacy settings.

### 2. Workout Management
* **Create Workouts:** Users can create custom workouts with names and types (e.g., Strength, Cardio).
* **Exercise Logging:**
    * Detailed logging for various exercises.
    * **Conditional Inputs:**
        * Strength training: Sets, Reps, Weight (lbs).
        * Running: Duration (minutes).
    * **Expandable Logs:** View details and manage logs easily.

### 3. Goal Tracking
* Set personal fitness goals with descriptions and target dates.
* Mark goals as active or completed.
* Track your achievements over time.

### 4. Progress Tracking
* **Log-Specific Progress:** Track detailed metrics for specific exercise logs.
* **Flexible Metrics:** Add any metric (e.g., Heart Rate, Pain Level, Speed).
* **Detailed Entries:** Include values (decimals supported), dates (YYYY-MM-DD), and optional notes.
* **Visual History:** View a history of progress entries directly within the workout log.

### 5. Social & Privacy
* **Friend System:** Search for users, send/accept friend requests.
* **Privacy Controls:**
    * Toggle visibility for Workouts, Goals, and Progress independently.
    * Set profile visibility to 'Friends' or 'Private'.
* **View Profiles:** View friends' shared data based on their privacy settings.

## Technology Stack

### Frontend
* **Framework:** React Native with Expo
* **Language:** TypeScript
* **State Management:** React Hooks (`useState`)
* **Navigation:** Expo Router / React Navigation
* **HTTP Client:** Axios

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database Driver:** `mysql2`
* **Authentication:** `bcrypt` for password hashing

### Database
* **Database:** MySQL
* **Hosting:** Google Cloud SQL (assumed/local)

## Setup Instructions

### Prerequisites
* Node.js and npm installed.
* phpMyAdmin is installed and running.
* Expo Go app on your mobile device (or iOS Simulator/Android Emulator).

### 1. Database Setup
* Ensure your phpMyAdmin server is running.
* Create the database using the provided SQL schema.
* Configure your database connection in the backend `.env` file.

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd fitness-app-backend
```
Install dependencies:
```bash
npm install
```
Start the server:
```bash
node server.js
```
The server will run on `http://localhost:3000`.

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd fitness-app-frontend
```
Install dependencies:
```bash
npm install
```
Start the Expo development server:
```bash
npm run ios # For iOS Simulator
# OR
npm start # To run with Expo Go on a physical device
```

## API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **Auth** | | |
| `POST` | `/register` | Register a new user |
| `POST` | `/login` | Login user |
| **Workouts** | | |
| `GET` | `/workouts/:userId` | Get all workouts for a user |
| `POST` | `/workouts` | Create a new workout |
| `DELETE` | `/workouts/:id` | Delete a workout |
| **Logs** | | |
| `GET` | `/workouts/:workoutId/logs` | Get logs for a workout |
| `POST` | `/logs` | Add a log to a workout |
| `DELETE` | `/logs/:logId` | Delete a log |
| **Progress** | | |
| `GET` | `/logs/:logId/progress` | Get progress for a specific log |
| `POST` | `/logs/:logId/progress` | Add progress entry to a log |
| `DELETE` | `/progress/:progressId` | Delete a progress entry |
| **Goals** | | |
| `GET` | `/goals/:userId` | Get user goals |
| `POST` | `/goals` | Create a goal |
| `PUT` | `/goals/:id/complete` | Mark goal as complete |
