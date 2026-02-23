import { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GradientButton from "../components/GradientButton";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ username: "", age: "", country: "" });

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setForm({
          username: parsed.username,
          age: parsed.age,
          country: parsed.country,
        });
      }
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch("http://172.20.10.4:3000/updateProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          updates: form,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        Alert.alert("Profile updated!");
      } else {
        Alert.alert("Error", data.error);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile Settings</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          value={form.username}
          onChangeText={(text) => setForm({ ...form, username: text })}
          style={styles.input}
        />

        <Text style={styles.label}>Age</Text>
        <TextInput
          value={form.age}
          onChangeText={(text) => setForm({ ...form, age: text })}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.label}>Country</Text>
        <TextInput
          value={form.country}
          onChangeText={(text) => setForm({ ...form, country: text })}
          style={styles.input}
        />
      </View>

      <GradientButton title="Save Changes" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5FA",
    padding: 25,
  },
  header: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    color: "#1F1F39",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#555",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F2F2F7",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
  },
});
