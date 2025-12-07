-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 07, 2025 at 11:42 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fitnessappdb`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_RegisterUser` (IN `p_name` VARCHAR(100), IN `p_email` VARCHAR(150), IN `p_password_hash` VARCHAR(255))   BEGIN
    DECLARE new_user_id INT;
    START TRANSACTION;

    INSERT INTO Users(name, email, password)
    VALUES (p_name, p_email, p_password_hash);

    SET new_user_id = LAST_INSERT_ID();

    INSERT INTO Privacy_Settings(user_id, profile_visibility, share_workouts, share_goals, share_progress)
    VALUES (new_user_id, 'friends', TRUE, TRUE, TRUE);

    COMMIT;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `name`, `description`) VALUES
(1, 'Strength', 'Exercises that focus on muscle'),
(2, 'Cardio', 'Aerobic exercises for endurance'),
(3, 'Flexibility', 'Exercises to improve range of motion');

-- --------------------------------------------------------

--
-- Table structure for table `exercises`
--

CREATE TABLE `exercises` (
  `exercise_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `muscle_group` varchar(100) DEFAULT NULL,
  `difficulty_level` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exercises`
--

INSERT INTO `exercises` (`exercise_id`, `category_id`, `name`, `description`, `muscle_group`, `difficulty_level`) VALUES
(1, 1, 'Bench Press', 'Press a weighted barbell from chest level upwards.', 'Chest', 'Intermediate'),
(2, 1, 'Squat', 'Lower body exercise focusing on quads and glutes.', 'Legs', 'Intermediate'),
(3, 2, 'Running', 'Aerobic exercise to improve cardiovascular health.', 'Full Body', 'Beginner'),
(4, 3, 'Yoga Stretch', 'Series of stretches to improve flexibility.', 'Core', 'Beginner');

-- --------------------------------------------------------

--
-- Table structure for table `friendship`
--

CREATE TABLE `friendship` (
  `friendship_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_id_2` int(11) NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` datetime DEFAULT current_timestamp(),
  CONSTRAINT no_self_friendship CHECK (`user_id` <> `user_id_2`)
) ;

--
-- Dumping data for table `friendship`
--

INSERT INTO `friendship` (`friendship_id`, `user_id`, `user_id_2`, `status`, `created_at`) VALUES
(1, 1, 2, 'accepted', '2025-10-26 18:39:37'),
(2, 1, 3, 'pending', '2025-10-26 18:39:37'),
(3, 2, 3, 'accepted', '2025-10-26 18:39:37'),
(4, 19, 1, 'pending', '2025-12-04 16:54:56'),
(8, 20, 1, 'pending', '2025-12-05 03:43:22'),
(10, 19, 20, 'accepted', '2025-12-06 18:16:36');

-- --------------------------------------------------------

--
-- Table structure for table `goals`
--

CREATE TABLE `goals` (
  `goal_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `target_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `goals`
--

INSERT INTO `goals` (`goal_id`, `user_id`, `description`, `target_date`, `status`) VALUES
(1, 1, 'Run a 10k race', '2025-12-01', 'active'),
(2, 2, 'Lose 5 pounds', '2025-11-15', 'active'),
(3, 3, 'Do the splits', '2025-12-30', 'completed'),
(8, 1, '', '2024-12-31', 'active'),
(9, 1, '   ', '2024-12-31', 'active'),
(11, 19, 'asdf', '2024-12-31', 'completed'),
(12, 19, 'Run a mile', '2024-12-31', 'completed'),
(13, 19, '123', '2020-01-02', 'completed'),
(14, 19, 's', '2024-12-31', 'completed');

-- --------------------------------------------------------

--
-- Table structure for table `logs`
--

CREATE TABLE `logs` (
  `log_id` int(11) NOT NULL,
  `workout_id` int(11) NOT NULL,
  `exercise_id` int(11) NOT NULL,
  `log_date` date NOT NULL,
  `duration` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `sets` int(11) DEFAULT NULL,
  `reps` int(11) DEFAULT NULL,
  `weight_used` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `logs`
--

INSERT INTO `logs` (`log_id`, `workout_id`, `exercise_id`, `log_date`, `duration`, `notes`, `sets`, `reps`, `weight_used`) VALUES
(2, 2, 3, '2025-10-21', 30, 'Ran 5 kilometers in 30 minutes.', NULL, NULL, NULL),
(3, 3, 4, '2025-10-22', 40, 'Felt relaxed after the yoga session.', NULL, NULL, NULL),
(5, 8, 2, '2025-12-04', 0, '', 2, 2, 2.00),
(6, 8, 1, '2025-12-04', 0, '', 1, 1, 1.00),
(10, 8, 1, '2025-12-06', 0, '', 0, 1, 2.00);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `status` varchar(50) DEFAULT 'unread',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `user_id`, `type`, `message`, `status`, `created_at`) VALUES
(1, 1, 'Goal Update', '50% completed to finish your goal of running a 5k', 'unread', '2025-10-26 18:38:27'),
(2, 2, 'Workout Reminder', 'Don’t forget to do your pushups', 'unread', '2025-10-26 18:38:27'),
(4, 21, 'Reminder', 'You haven\'t worked out in a while! Time to get moving!', 'unread', '2025-12-05 04:20:51'),
(6, 21, 'Reminder', 'You haven\'t worked out in a while! Time to get moving!', 'unread', '2025-12-06 17:10:30'),
(7, 20, 'Friend Request', 'You have a new friend request!', 'unread', '2025-12-06 18:16:36');

-- --------------------------------------------------------

--
-- Table structure for table `privacy_settings`
--

CREATE TABLE `privacy_settings` (
  `privacy_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `profile_visibility` varchar(50) DEFAULT 'friends',
  `share_workouts` tinyint(1) DEFAULT 1,
  `share_goals` tinyint(1) DEFAULT 1,
  `share_progress` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `privacy_settings`
--

INSERT INTO `privacy_settings` (`privacy_id`, `user_id`, `profile_visibility`, `share_workouts`, `share_goals`, `share_progress`) VALUES
(1, 1, 'friends', 1, 1, 1),
(2, 2, 'public', 1, 1, 1),
(3, 3, 'private', 0, 1, 0),
(8, 19, 'friends', 1, 1, 1),
(9, 20, 'private', 1, 1, 1),
(10, 21, 'friends', 1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `progress_tracking`
--

CREATE TABLE `progress_tracking` (
  `progress_id` int(11) NOT NULL,
  `log_id` int(11) NOT NULL,
  `metric` varchar(100) NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `progress_tracking`
--

INSERT INTO `progress_tracking` (`progress_id`, `log_id`, `metric`, `value`, `date`, `notes`) VALUES
(2, 2, 'Distance (mi)', 5.00, '2025-10-21', 'very slow'),
(3, 3, 'Flexibility Score', 3.00, '2025-10-22', 'needs work'),
(7, 5, 'Heart Rate', 150.00, '2025-12-06', '');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `created_at`) VALUES
(1, 'Michael He', 'michael@gmail.com', '1234', '2025-10-26 18:28:54'),
(2, 'Pele Boupha', 'pele@yahoo.com', 'password', '2025-10-26 18:28:54'),
(3, 'John Johnson', 'john@gmail.com', 'johnny', '2025-10-26 18:28:54'),
(19, 'xdd', 'xdd', '$2b$10$wSXE1eQTIuCwes5tZRkYJe77n1//bqaDj05oyK6d5EcNwO8UxMDYy', '2025-12-04 16:52:22'),
(20, 'xddd', 'xddd', '$2b$10$fDUJCPx8EZyKROoIBbKho.W5bLj/HsvqoMijLUGv5Oll9uA31ZUXS', '2025-12-04 16:56:58'),
(21, 'xd', 'xd', '$2b$10$4pzJyUBMW5Qde0JDvhtIMeNdGYpj4HKUV8YqA2BsdONGlWzb.sw62', '2025-12-05 04:20:50');

-- --------------------------------------------------------

--
-- Table structure for table `workouts`
--

CREATE TABLE `workouts` (
  `workout_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workouts`
--

INSERT INTO `workouts` (`workout_id`, `user_id`, `name`, `type`, `duration`, `date`) VALUES
(1, 1, 'Squats', 'Functional', 10, '2025-11-01'),
(2, 2, 'Morning Cardio', 'Cardio', 30, '2025-10-21'),
(3, 3, 'Yoga \r\n', 'Flexibility', 45, '2025-10-22'),
(4, 1, 'Indoor Run', 'Cardio', 45, '2025-11-08'),
(8, 19, 'What', 'What', 30, '2025-12-04'),
(10, 20, 'a', 'Strength', 30, '2025-12-05'),
(11, 21, 'Test', 'Strength', 30, '2025-12-06');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `exercises`
--
ALTER TABLE `exercises`
  ADD PRIMARY KEY (`exercise_id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `friendship`
--
ALTER TABLE `friendship`
  ADD PRIMARY KEY (`friendship_id`),
  ADD UNIQUE KEY `unique_friendship` (`user_id`,`user_id_2`),
  ADD KEY `user_id_2` (`user_id_2`);

--
-- Indexes for table `goals`
--
ALTER TABLE `goals`
  ADD PRIMARY KEY (`goal_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `workout_id` (`workout_id`),
  ADD KEY `exercise_id` (`exercise_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `privacy_settings`
--
ALTER TABLE `privacy_settings`
  ADD PRIMARY KEY (`privacy_id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `progress_tracking`
--
ALTER TABLE `progress_tracking`
  ADD PRIMARY KEY (`progress_id`),
  ADD KEY `log_id` (`log_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `workouts`
--
ALTER TABLE `workouts`
  ADD PRIMARY KEY (`workout_id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `exercises`
--
ALTER TABLE `exercises`
  MODIFY `exercise_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `friendship`
--
ALTER TABLE `friendship`
  MODIFY `friendship_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `goals`
--
ALTER TABLE `goals`
  MODIFY `goal_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `logs`
--
ALTER TABLE `logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `privacy_settings`
--
ALTER TABLE `privacy_settings`
  MODIFY `privacy_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `progress_tracking`
--
ALTER TABLE `progress_tracking`
  MODIFY `progress_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `workouts`
--
ALTER TABLE `workouts`
  MODIFY `workout_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `exercises`
--
ALTER TABLE `exercises`
  ADD CONSTRAINT `exercises_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`);

--
-- Constraints for table `friendship`
--
ALTER TABLE `friendship`
  ADD CONSTRAINT `friendship_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `friendship_ibfk_2` FOREIGN KEY (`user_id_2`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `goals`
--
ALTER TABLE `goals`
  ADD CONSTRAINT `goals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `logs`
--
ALTER TABLE `logs`
  ADD CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`workout_id`) REFERENCES `workouts` (`workout_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `logs_ibfk_2` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`exercise_id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `privacy_settings`
--
ALTER TABLE `privacy_settings`
  ADD CONSTRAINT `privacy_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `progress_tracking`
--
ALTER TABLE `progress_tracking`
  ADD CONSTRAINT `progress_tracking_ibfk_1` FOREIGN KEY (`log_id`) REFERENCES `logs` (`log_id`) ON DELETE CASCADE;

--
-- Constraints for table `workouts`
--
ALTER TABLE `workouts`
  ADD CONSTRAINT `workouts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
