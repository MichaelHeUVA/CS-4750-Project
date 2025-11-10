import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import axios from "axios";

export default function App() {
  // State for the Registration Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State for displaying workouts
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Functionality 1: Handle User Registration ---
  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/register`,
        {
          name,
          email,
          password,
        }
      );
      Alert.alert("Success", response.data.message);
      // Clear the form
      setName("");
      setEmail("");
      setPassword("");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      Alert.alert("Registration Error", errorMessage);
    }
  };

  // --- Functionality 2: Fetch Recent Workouts ---
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        // TODO: don't hard code the user_id
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_API_BASE_URL}/workouts/1`
        );
        console.log(response.data);
        setWorkouts(response.data);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Could not fetch workouts.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* --- Registration Section --- */}
        <View style={styles.section}>
          <Text style={styles.header}>Register New User</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button title="Register" onPress={handleRegister} />
        </View>

        {/* --- Workouts Section --- */}
        <View style={styles.section}>
          <Text style={styles.header}>Recent Workouts (User ID: 1)</Text>
          {loading ? (
            <Text>Loading workouts...</Text>
          ) : workouts.length > 0 ? (
            workouts.map((workout) => (
              <View key={workout.workout_id} style={styles.workoutCard}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text>Type: {workout.type}</Text>
                <Text>Duration: {workout.duration} mins</Text>
                <Text>Date: {new Date(workout.date).toLocaleDateString()}</Text>
              </View>
            ))
          ) : (
            <Text>No recent workouts found.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Basic Styling ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  section: {
    margin: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  workoutCard: {
    padding: 15,
    backgroundColor: "#e9efff",
    borderRadius: 8,
    marginBottom: 10,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: "600",
  },
});
