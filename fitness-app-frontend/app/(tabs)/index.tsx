import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface User {
  user_id: number;
  name: string;
  email: string;
}

interface Workout {
  workout_id: number;
  name: string;
  type: string;
  date: string;
  duration: number;
}

interface Goal {
  goal_id: number;
  description: string;
  status: string;
  target_date?: string;
}

interface Friend {
  user_id: number;
  name: string;
  email: string;
}

interface FriendRequest {
  friendship_id: number;
  user_id: number;
  name: string;
  email: string;
}

interface Exercise {
  exercise_id: number;
  name: string;
}

interface Category {
  category_id: number;
  name: string;
  description: string;
}

interface Log {
  log_id: number;
  exercise_id: number;
  exercise_name?: string;
  sets: number;
  reps: number;
  weight_used: number;
  duration?: number;
}

interface ProfileData {
  privacy: {
    share_workouts?: boolean | number;
    share_goals?: boolean | number;
    share_progress?: boolean | number;
    profile_visibility?: string;
  };
  notifications: any[];
}

interface Progress {
  progress_id: number;
  metric: string;
  value: number;
  date: string;
  notes: string;
}

interface FriendData {
  workouts?: Workout[];
  goals?: Goal[];
  progress?: Progress[];
}

export default function App() {
  // --- GLOBAL STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState("workouts"); // 'workouts', 'goals', 'friends', 'profile', 'progress'

  // --- AUTH STATE ---
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // --- DATA STATE ---
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [profileData, setProfileData] = useState<ProfileData>({
    privacy: {
      share_workouts: 1,
      share_goals: 1,
      share_progress: 1,
      profile_visibility: 'friends'
    },
    notifications: [],
  });
  const [exercises, setExercises] = useState<Exercise[]>([]); // List of available exercises
  const [categories, setCategories] = useState<Category[]>([]); // List of workout categories

  // --- MODAL STATE ---
  const [workoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [friendModalVisible, setFriendModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null); // For viewing details
  const [workoutLogs, setWorkoutLogs] = useState<Log[]>([]); // Logs for selected workout
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedFriendData, setSelectedFriendData] = useState<FriendData | null>(null);

  // --- FORM INPUTS ---
  const [newWorkoutName, setNewWorkoutName] = useState("");
  const [newWorkoutType, setNewWorkoutType] = useState("");
  const [newGoalDesc, setNewGoalDesc] = useState("");
  const [newGoalDate, setNewGoalDate] = useState(""); // YYYY-MM-DD
  const [friendSearch, setFriendSearch] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

  // Progress Inputs
  const [newProgressMetric, setNewProgressMetric] = useState("");
  const [newProgressValue, setNewProgressValue] = useState("");
  const [newProgressDate, setNewProgressDate] = useState("");
  const [newProgressNotes, setNewProgressNotes] = useState("");

  // Log Inputs
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [duration, setDuration] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
  const [logProgress, setLogProgress] = useState<Progress[]>([]);
  const [logProgressMetric, setLogProgressMetric] = useState("");
  const [logProgressValue, setLogProgressValue] = useState("");
  const [logProgressDate, setLogProgressDate] = useState("");
  const [logProgressNotes, setLogProgressNotes] = useState("");

  // ===========================================
  // 1. AUTH & NAVIGATION
  // ===========================================
  const handleAuth = async () => {
    try {
      const endpoint = isLoginView ? "/login" : "/register";
      const payload = isLoginView
        ? { email, password }
        : { name, email, password };
      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      if (isLoginView) {
        setUser(res.data);
        fetchAllData(res.data.user_id);
      } else {
        Alert.alert("Success", "Registered! Please login.");
        setIsLoginView(true);
      }
    } catch (err) {
      Alert.alert("Error", "Auth failed");
    }
  };

  const fetchAllData = (userId: number) => {
    fetchWorkouts(userId);
    fetchGoals(userId);
    fetchFriends(userId);
    fetchFriendRequests(userId);
    fetchProfile(userId);
    fetchExercises();
    fetchCategories();
  };

  const logout = () => {
    setUser(null);
    setIsLoginView(true);
    setEmail("");
    setPassword("");
    setName("");

    // Reset Data
    setWorkouts([]);
    setGoals([]);
    setFriends([]);
    setFriendRequests([]);
    setProgress([]);
    setProfileData({ privacy: {}, notifications: [] });
    // Exercises and Categories can stay as they are global/static usually, but if user specific, reset. 
    // They seem to be fetched once. Let's keep them or reset if we want fresh fetch on next login.
    // Given fetchAllData fetches them, resetting is safer.
    setExercises([]);
    setCategories([]);

    // Reset UI State
    setCurrentView("workouts");
    setWorkoutModalVisible(false);
    setLogModalVisible(false);
    setFriendModalVisible(false);
    setSelectedWorkout(null);
    setWorkoutLogs([]);
    setSelectedFriend(null);
    setSelectedFriendData(null);

    // Reset Inputs
    setNewWorkoutName("");
    setNewWorkoutType("");
    setNewGoalDesc("");
    setNewGoalDate("");
    setFriendSearch("");
    setSearchResults([]);
    setNewProgressMetric("");
    setNewProgressValue("");
    setNewProgressDate("");
    setNewProgressNotes("");
    setSelectedExerciseId(null);
    setSets("");
    setReps("");
    setWeight("");
    setDuration("");
    setExpandedLogId(null);
    setLogProgress([]);
    setLogProgressMetric("");
    setLogProgressValue("");
    setLogProgressDate("");
    setLogProgressNotes("");
  };

  // ===========================================
  // 2. DATA FETCHING
  // ===========================================
  const fetchWorkouts = async (uid: number) => {
    const res = await axios.get(`${API_URL}/workouts/${uid}`);
    setWorkouts(res.data);
  };
  const fetchGoals = async (uid: number) => {
    const res = await axios.get(`${API_URL}/goals/${uid}`);
    setGoals(res.data);
  };
  const fetchFriends = async (uid: number) => {
    const res = await axios.get(`${API_URL}/friends/${uid}`);
    setFriends(res.data);
  };
  const fetchFriendRequests = async (uid: number) => {
    const res = await axios.get(`${API_URL}/friends/requests/${uid}`);
    setFriendRequests(res.data);
  };
  const fetchProfile = async (uid: number) => {
    const res = await axios.get(`${API_URL}/profile/${uid}`);
    setProfileData(res.data);
  };
  const fetchExercises = async () => {
    const res = await axios.get(`${API_URL}/exercises`);
    setExercises(res.data);
    if (res.data.length > 0) setSelectedExerciseId(res.data[0].exercise_id);
  };
  const fetchCategories = async () => {
    const res = await axios.get(`${API_URL}/categories`);
    setCategories(res.data);
    if (res.data.length > 0) setNewWorkoutType(res.data[0].name);
  };

  // ===========================================
  // 3. WORKOUTS & LOGS LOGIC
  // ===========================================
  const createWorkout = async () => {
    if (!newWorkoutName || !user) return;
    await axios.post(`${API_URL}/workouts`, {
      user_id: user.user_id,
      name: newWorkoutName,
      type: newWorkoutType,
      duration: 30,
    });
    setWorkoutModalVisible(false);
    fetchWorkouts(user.user_id);
  };

  const openWorkoutDetails = async (workout: Workout) => {
    setSelectedWorkout(workout);
    // Fetch logs for this workout
    const res = await axios.get(
      `${API_URL}/workouts/${workout.workout_id}/logs`
    );
    setWorkoutLogs(res.data);
    setLogModalVisible(true);
  };

  const addLog = async () => {
    if (!selectedWorkout) return;
    await axios.post(`${API_URL}/logs`, {
      workout_id: selectedWorkout.workout_id,
      exercise_id: selectedExerciseId,
      sets: sets ? parseInt(sets) : 0,
      reps: reps ? parseInt(reps) : 0,
      weight_used: weight ? parseFloat(weight) : 0,
      duration: duration ? parseInt(duration) : 0,
      notes: "",
    });
    // Refresh logs
    const res = await axios.get(
      `${API_URL}/workouts/${selectedWorkout.workout_id}/logs`
    );
    setWorkoutLogs(res.data);
    setSets("");
    setReps("");
    setWeight("");
    setDuration("");
  };

  const toggleLogExpansion = async (logId: number) => {
    if (expandedLogId === logId) {
      setExpandedLogId(null);
      setLogProgress([]);
    } else {
      setExpandedLogId(logId);
      // Fetch progress for this log
      try {
        const res = await axios.get(`${API_URL}/logs/${logId}/progress`);
        setLogProgress(res.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const addProgressToLog = async (logId: number) => {
    if (!logProgressMetric || !logProgressValue) {
      Alert.alert("Error", "Metric and Value are required");
      return;
    }

    // Decimal validation
    const val = parseFloat(logProgressValue);
    if (isNaN(val)) {
      Alert.alert("Error", "Value must be a number");
      return;
    }

    // Date validation
    let dateToSend = new Date().toISOString().split('T')[0];
    if (logProgressDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(logProgressDate)) {
        Alert.alert("Error", "Date must be YYYY-MM-DD");
        return;
      }
      dateToSend = logProgressDate;
    }

    await axios.post(`${API_URL}/logs/${logId}/progress`, {
      metric: logProgressMetric,
      value: val,
      date: dateToSend,
      notes: logProgressNotes
    });

    setLogProgressMetric("");
    setLogProgressValue("");
    setLogProgressDate("");
    setLogProgressNotes("");

    // Refresh
    const res = await axios.get(`${API_URL}/logs/${logId}/progress`);
    setLogProgress(res.data);
  };

  const deleteWorkout = async (id: number) => {
    if (!user) return;
    await axios.delete(`${API_URL}/workouts/${id}`);
    fetchWorkouts(user.user_id);
  };

  const dismissNotification = async (id: number) => {
    if (!user) return;
    await axios.delete(`${API_URL}/notifications/${id}`);
    fetchProfile(user.user_id);
  };

  // ===========================================
  // 4. GOALS & FRIENDS LOGIC
  // ===========================================
  const addGoal = async () => {
    if (!newGoalDesc.trim() || !user) {
      if (!newGoalDesc.trim()) Alert.alert("Error", "Goal description cannot be empty");
      return;
    }
    // Date validation
    if (newGoalDate && !/^\d{4}-\d{2}-\d{2}$/.test(newGoalDate)) {
      Alert.alert("Error", "Date must be YYYY-MM-DD");
      return;
    }

    await axios.post(`${API_URL}/goals`, {
      user_id: user.user_id,
      description: newGoalDesc,
      target_date: newGoalDate || "2024-12-31",
    });
    setNewGoalDesc("");
    setNewGoalDate("");
    fetchGoals(user.user_id);
  };

  const markGoalComplete = async (id: number) => {
    if (!user) return;
    await axios.put(`${API_URL}/goals/${id}/complete`);
    fetchGoals(user.user_id);
  };

  const markGoalIncomplete = async (id: number) => {
    if (!user) return;
    await axios.put(`${API_URL}/goals/${id}/incomplete`);
    fetchGoals(user.user_id);
  };

  const deleteGoal = async (id: number) => {
    if (!user) return;
    await axios.delete(`${API_URL}/goals/${id}`);
    fetchGoals(user.user_id);
  };

  const searchUsers = async (text: string) => {
    setFriendSearch(text);
    if (text.length > 2 && user) {
      const res = await axios.get(`${API_URL}/users/search?q=${text}&userId=${user.user_id}`);
      setSearchResults(res.data);
    } else {
      setSearchResults([]);
    }
  };

  const addFriend = async (friendId: number) => {
    if (!user) return;
    try {
      await axios.post(`${API_URL}/friends/request`, {
        user_id: user.user_id,
        friend_id: friendId,
      });
      Alert.alert("Sent", "Friend request sent!");
      setSearchResults([]);
      setFriendSearch("");
    } catch (err) {
      Alert.alert("Error", "Cannot add friend");
    }
  };

  const acceptFriend = async (friendshipId: number) => {
    if (!user) return;
    await axios.put(`${API_URL}/friends/${friendshipId}/accept`);
    fetchFriendRequests(user.user_id);
    fetchFriends(user.user_id);
  };

  const removeFriend = async (friendId: number) => { // Using friend's user_id
    if (!user) return;
    await axios.delete(`${API_URL}/friends/${user.user_id}/${friendId}`);
    fetchFriends(user.user_id);
  };

  const viewFriendData = async (friend: Friend) => {
    if (!user) return;
    setSelectedFriend(friend);
    try {
      const res = await axios.get(`${API_URL}/friends/${friend.user_id}/data?viewerId=${user.user_id}`);
      setSelectedFriendData(res.data);
      setFriendModalVisible(true);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message === "Profile is private") {
        Alert.alert("Private Profile", "This user's profile is set to private.");
      } else {
        Alert.alert("Error", "Could not fetch friend data (Privacy settings?)");
      }
    }
  };

  // ===========================================
  // 5. RENDER SCREENS
  // ===========================================
  const renderLogin = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.title}>Fitness App</Text>
      {!isLoginView && (
        <TextInput
          placeholder="Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
      )}
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.btnPrimary} onPress={handleAuth}>
        <Text style={styles.btnText}>{isLoginView ? "Login" : "Register"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsLoginView(!isLoginView)}>
        <Text style={styles.linkText}>
          {isLoginView ? "Create Account" : "Back to Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderWorkouts = () => (
    <ScrollView style={styles.viewContainer}>
      <TouchableOpacity
        style={styles.btnAdd}
        onPress={() => setWorkoutModalVisible(true)}
      >
        <Text style={styles.btnText}>+ New Workout</Text>
      </TouchableOpacity>
      {workouts.map((w) => (
        <View key={w.workout_id} style={styles.card}>
          <TouchableOpacity onPress={() => openWorkoutDetails(w)}>
            <Text style={styles.cardTitle}>{w.name}</Text>
            <Text style={styles.cardSub}>
              {w.type} • {w.date ? w.date.split("T")[0] : ""}
            </Text>
            <Text style={styles.cardAction}>Tap to view/add logs</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteWorkout(w.workout_id)} style={{ marginTop: 5 }}>
            <Text style={{ color: 'red', fontSize: 12 }}>Remove Workout</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  // renderProgress removed


  const renderGoals = () => (
    <ScrollView style={styles.viewContainer}>
      <View style={styles.inputRow}>
        <View style={{ flex: 1 }}>
          <TextInput
            placeholder="New Goal (e.g. Lose 5lbs)"
            style={styles.input}
            value={newGoalDesc}
            onChangeText={setNewGoalDesc}
          />
          <TextInput
            placeholder="Target Date (YYYY-MM-DD)"
            style={styles.input}
            value={newGoalDate}
            onChangeText={setNewGoalDate}
          />
        </View>
        <TouchableOpacity style={styles.btnSmall} onPress={addGoal}>
          <Text style={styles.btnText}>Add</Text>
        </TouchableOpacity>
      </View>
      {goals.map((g) => (
        <View key={g.goal_id} style={styles.card}>
          <Text
            style={[
              styles.cardTitle,
              g.status === "completed" && {
                textDecorationLine: "line-through",
                color: "green",
              },
            ]}
          >
            {g.description}
          </Text>
          <Text style={styles.cardSub}>Target: {g.target_date ? g.target_date.split("T")[0] : "None"}</Text>
          <Text style={styles.cardSub}>Status: {g.status}</Text>
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            {g.status !== "completed" ? (
              <TouchableOpacity onPress={() => markGoalComplete(g.goal_id)} style={{ marginRight: 15 }}>
                <Text style={styles.linkText}>Mark Complete</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => markGoalIncomplete(g.goal_id)} style={{ marginRight: 15 }}>
                <Text style={styles.linkText}>Mark Incomplete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => deleteGoal(g.goal_id)}>
              <Text style={[styles.linkText, { color: 'red' }]}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderFriends = () => (
    <ScrollView style={styles.viewContainer}>
      <TextInput
        placeholder="Search users by email..."
        style={styles.input}
        value={friendSearch}
        onChangeText={searchUsers}
      />
      {searchResults.map((u) => (
        <TouchableOpacity
          key={u.user_id}
          style={styles.resultItem}
          onPress={() => addFriend(u.user_id)}
        >
          <Text>
            Add {u.name} ({u.email})
          </Text>
        </TouchableOpacity>
      ))}

      {friendRequests.length > 0 && (
        <View>
          <Text style={styles.headerTitle}>Friend Requests</Text>
          {friendRequests.map(r => (
            <View key={r.friendship_id} style={styles.card}>
              <Text style={styles.cardTitle}>{r.name}</Text>
              <TouchableOpacity onPress={() => acceptFriend(r.friendship_id)}>
                <Text style={styles.linkText}>Accept Request</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.headerTitle}>My Friends</Text>
      {friends.length === 0 ? (
        <Text>No friends yet.</Text>
      ) : (
        friends.map((f) => (
          <View key={f.user_id} style={styles.card}>
            <TouchableOpacity onPress={() => viewFriendData(f)}>
              <Text style={styles.cardTitle}>{f.name}</Text>
              <Text style={styles.cardSub}>{f.email}</Text>
              <Text style={styles.cardAction}>Tap to view profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeFriend(f.user_id)} style={{ marginTop: 5 }}>
              <Text style={[styles.linkText, { color: 'red', marginTop: 0 }]}>Remove Friend</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );

  const updatePrivacy = async (key: string, val: any) => {
    if (!user) return;
    const newPrivacy = { ...profileData.privacy, [key]: val };
    setProfileData({ ...profileData, privacy: newPrivacy });
    await axios.put(`${API_URL}/profile/${user.user_id}/privacy`, newPrivacy);
  };

  const renderProfile = () => (
    <ScrollView style={styles.viewContainer}>
      <Text style={styles.headerTitle}>Privacy Settings</Text>
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text>Share Workouts</Text>
          <TouchableOpacity onPress={() => updatePrivacy('share_workouts', !profileData.privacy?.share_workouts)}>
            <Text style={{ color: profileData.privacy?.share_workouts ? 'green' : 'red' }}>
              {profileData.privacy?.share_workouts ? "Enabled" : "Disabled"}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text>Share Goals</Text>
          <TouchableOpacity onPress={() => updatePrivacy('share_goals', !profileData.privacy?.share_goals)}>
            <Text style={{ color: profileData.privacy?.share_goals ? 'green' : 'red' }}>
              {profileData.privacy?.share_goals ? "Enabled" : "Disabled"}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text>Share Progress</Text>
          <TouchableOpacity onPress={() => updatePrivacy('share_progress', !profileData.privacy?.share_progress)}>
            <Text style={{ color: profileData.privacy?.share_progress ? 'green' : 'red' }}>
              {profileData.privacy?.share_progress ? "Enabled" : "Disabled"}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text>Profile Visibility</Text>
          <TouchableOpacity onPress={() => {
            const modes = ['friends', 'private']; // Removed public
            const current = profileData.privacy?.profile_visibility || 'friends';
            const next = modes[(modes.indexOf(current) + 1) % modes.length];
            updatePrivacy('profile_visibility', next);
          }}>
            <Text style={{ color: '#007AFF' }}>{profileData.privacy?.profile_visibility || 'friends'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.headerTitle}>Notifications</Text>
      {profileData.notifications.map((n) => (
        <View key={n.notification_id} style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text>{n.message}</Text>
              <Text style={styles.cardSub}>{n.created_at.split("T")[0]}</Text>
            </View>
            <TouchableOpacity onPress={() => dismissNotification(n.notification_id)}>
              <Text style={{ color: '#999' }}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  // --- MAIN RENDER ---
  if (!user) return renderLogin();

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fitness App</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={{ color: "red" }}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View style={{ flex: 1 }}>
        {currentView === "workouts" && renderWorkouts()}
        {currentView === "goals" && renderGoals()}
        {currentView === "friends" && renderFriends()}
        {currentView === "profile" && renderProfile()}
      </View>

      {/* Bottom Tabs */}
      <View style={styles.tabBar}>
        {["Workouts", "Goals", "Friends", "Profile"].map((view) => (
          <TouchableOpacity
            key={view}
            style={styles.tabItem}
            onPress={() => setCurrentView(view.toLowerCase())}
          >
            <Text
              style={[
                styles.tabText,
                currentView === view.toLowerCase() && styles.tabActive,
              ]}
            >
              {view}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* --- MODALS --- */}
      {/* 3. Friend Data Modal */}
      <Modal visible={friendModalVisible} animationType="slide">
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{selectedFriend?.name}'s Profile</Text>
            <TouchableOpacity onPress={() => setFriendModalVisible(false)}>
              <Text style={styles.linkText}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.viewContainer}>
            {selectedFriendData?.workouts && (
              <View>
                <Text style={styles.headerTitle}>Workouts</Text>
                {selectedFriendData.workouts.map(w => (
                  <View key={w.workout_id} style={styles.card}>
                    <Text style={styles.cardTitle}>{w.name}</Text>
                    <Text style={styles.cardSub}>{w.type} • {w.date.split('T')[0]}</Text>
                  </View>
                ))}
              </View>
            )}
            {selectedFriendData?.goals && (
              <View>
                <Text style={styles.headerTitle}>Goals</Text>
                {selectedFriendData.goals.map(g => (
                  <View key={g.goal_id} style={styles.card}>
                    <Text style={styles.cardTitle}>{g.description}</Text>
                    <Text style={styles.cardSub}>{g.status}</Text>
                  </View>
                ))}
              </View>
            )}
            {selectedFriendData?.progress && (
              <View>
                <Text style={styles.headerTitle}>Progress</Text>
                {selectedFriendData.progress.map(p => (
                  <View key={p.progress_id} style={styles.card}>
                    <Text style={styles.cardTitle}>{p.metric}: {p.value}</Text>
                    <Text style={styles.cardSub}>{p.date.split('T')[0]}</Text>
                  </View>
                ))}
              </View>
            )}
            {!selectedFriendData?.workouts && !selectedFriendData?.goals && !selectedFriendData?.progress && (
              <Text style={{ textAlign: 'center', marginTop: 20 }}>No data shared.</Text>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 1. New Workout Modal */}
      <Modal visible={workoutModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>New Workout</Text>
            <TextInput
              placeholder="Name (e.g. Leg Day)"
              style={styles.input}
              value={newWorkoutName}
              onChangeText={setNewWorkoutName}
            />
            <Text style={{ marginBottom: 5, fontWeight: 'bold' }}>Type:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
              {categories.map(c => (
                <TouchableOpacity
                  key={c.category_id}
                  style={[
                    styles.btnSmall,
                    { backgroundColor: newWorkoutType === c.name ? '#007AFF' : '#eee', marginLeft: 0, marginRight: 5, marginBottom: 5 }
                  ]}
                  onPress={() => setNewWorkoutType(c.name)}
                >
                  <Text style={{ color: newWorkoutType === c.name ? '#fff' : '#000' }}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.btnPrimary} onPress={createWorkout}>
              <Text style={styles.btnText}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setWorkoutModalVisible(false)}>
              <Text style={styles.linkText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 2. Log/Details Modal */}
      <Modal visible={logModalVisible} animationType="slide">
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {selectedWorkout?.name} Details
            </Text>
            <TouchableOpacity onPress={() => setLogModalVisible(false)}>
              <Text style={styles.linkText}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.viewContainer}>
            <Text style={styles.headerTitle}>Add Exercise Log</Text>
            <View style={styles.card}>
              <Text style={{ marginBottom: 5 }}>Select Exercise:</Text>
              <TouchableOpacity
                style={[styles.input, { justifyContent: 'center' }]}
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Text>{selectedExerciseId ? exercises.find(e => e.exercise_id === selectedExerciseId)?.name : "Select an Exercise..."}</Text>
              </TouchableOpacity>

              {isDropdownOpen && (
                <View style={{ maxHeight: 200, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 10 }}>
                  <ScrollView nestedScrollEnabled={true}>
                    {exercises.map(e => (
                      <TouchableOpacity
                        key={e.exercise_id}
                        style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                        onPress={() => {
                          setSelectedExerciseId(e.exercise_id);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <Text style={{ fontSize: 16 }}>{e.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Conditional Inputs */}
              {(selectedExerciseId && exercises.find(e => e.exercise_id === selectedExerciseId)?.name === "Running") ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <TextInput
                    placeholder="Duration (mins)"
                    style={[styles.input, { flex: 1 }]}
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="numeric"
                  />
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <TextInput
                    placeholder="Sets"
                    style={[styles.input, { width: "30%" }]}
                    value={sets}
                    onChangeText={setSets}
                    keyboardType="numeric"
                  />
                  <TextInput
                    placeholder="Reps"
                    style={[styles.input, { width: "30%" }]}
                    value={reps}
                    onChangeText={setReps}
                    keyboardType="numeric"
                  />
                  <TextInput
                    placeholder="Lbs"
                    style={[styles.input, { width: "30%" }]}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                  />
                </View>
              )}
              <TouchableOpacity style={styles.btnSmall} onPress={addLog}>
                <Text style={styles.btnText}>Add Log</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.headerTitle}>Exercise History</Text>
            {workoutLogs.map((log) => (
              <View key={log.log_id} style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity onPress={() => toggleLogExpansion(log.log_id)} style={{ flex: 1 }}>
                    <View>
                      <Text style={styles.cardTitle}>
                        {log.exercise_name || `Exercise ${log.exercise_id}`}
                        {expandedLogId === log.log_id ? " (Collaspe)" : " (Expand)"}
                      </Text>
                      <Text>
                        {exercises.find(e => e.exercise_id === log.exercise_id)?.name === "Running" || log.exercise_name === "Running"
                          ? `${log.duration} mins`
                          : `${log.sets} sets x ${log.reps} reps @ ${log.weight_used}lbs`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={async () => {
                    await axios.delete(`${API_URL}/logs/${log.log_id}`);
                    // Refresh logs
                    const res = await axios.get(`${API_URL}/workouts/${selectedWorkout?.workout_id}/logs`);
                    setWorkoutLogs(res.data);
                  }}>
                    <Text style={{ color: 'red' }}>Remove</Text>
                  </TouchableOpacity>
                </View>

                {/* Expanded Progress Section */}
                {expandedLogId === log.log_id && (
                  <View style={{ marginTop: 15, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }}>
                    <Text style={[styles.cardTitle, { fontSize: 14 }]}>Progress Tracking</Text>

                    {/* Add Progress Form */}
                    <View style={{ marginBottom: 10 }}>
                      <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                        <TextInput
                          placeholder="Metric (e.g. Heart Rate)"
                          style={[styles.input, { flex: 1, marginRight: 5, marginBottom: 0 }]}
                          value={logProgressMetric}
                          onChangeText={setLogProgressMetric}
                        />
                        <TextInput
                          placeholder="Value (e.g. 150)"
                          style={[styles.input, { flex: 1, marginBottom: 0 }]}
                          value={logProgressValue}
                          onChangeText={setLogProgressValue}
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                        <TextInput
                          placeholder="Date (YYYY-MM-DD)"
                          style={[styles.input, { flex: 1, marginRight: 5, marginBottom: 0 }]}
                          value={logProgressDate}
                          onChangeText={setLogProgressDate}
                        />
                        <TouchableOpacity style={[styles.btnSmall, { flex: 0.4, marginLeft: 0 }]} onPress={() => addProgressToLog(log.log_id)}>
                          <Text style={styles.btnText}>Add</Text>
                        </TouchableOpacity>
                      </View>
                      <TextInput
                        placeholder="Notes (Optional)"
                        style={[styles.input, { marginBottom: 0 }]}
                        value={logProgressNotes}
                        onChangeText={setLogProgressNotes}
                      />
                    </View>

                    {/* Progress List */}
                    {logProgress.length === 0 ? (
                      <Text style={styles.cardSub}>No progress entries.</Text>
                    ) : (
                      logProgress.map(p => (
                        <View key={p.progress_id} style={{ paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{p.metric}: {p.value}</Text>
                            <Text style={{ fontSize: 12, color: '#666' }}>{p.date.split('T')[0]}</Text>
                          </View>
                          {p.notes ? <Text style={{ fontSize: 12, fontStyle: 'italic', marginTop: 2 }}>{p.notes}</Text> : null}
                          <TouchableOpacity onPress={async () => {
                            await axios.delete(`${API_URL}/progress/${p.progress_id}`);
                            // Refresh
                            const res = await axios.get(`${API_URL}/logs/${log.log_id}/progress`);
                            setLogProgress(res.data);
                          }}>
                            <Text style={{ color: 'red', fontSize: 12, textAlign: 'right', marginTop: 5 }}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      )))
                    }
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  centerContainer: { flex: 1, justifyContent: "center", padding: 20 },
  viewContainer: { flex: 1, padding: 15 },
  header: {
    padding: 15,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  btnPrimary: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  btnSmall: {
    backgroundColor: "#34C759",
    padding: 12,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnAdd: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  linkText: { color: "#007AFF", marginTop: 15, textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold" },
  cardSub: { color: "#666", marginTop: 4 },
  cardAction: { color: "#007AFF", marginTop: 8, fontSize: 12 },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingBottom: 20,
    paddingTop: 10,
  },
  tabItem: { flex: 1, alignItems: "center" },
  tabText: { color: "#999", fontSize: 12 },
  tabActive: { color: "#007AFF", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  resultItem: {
    padding: 15,
    backgroundColor: "#eef",
    marginBottom: 5,
    borderRadius: 8,
  },
});
