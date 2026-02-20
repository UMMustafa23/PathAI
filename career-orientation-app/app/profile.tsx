import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      const res = await fetch("http://172.26.79.79:3000/updateProfile", {
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
      console.log(err);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Edit Profile</Text>

      <Text>Username</Text>
      <TextInput
        value={form.username}
        onChangeText={(text) => setForm({ ...form, username: text })}
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />

      <Text>Age</Text>
      <TextInput
        value={form.age}
        onChangeText={(text) => setForm({ ...form, age: text })}
        keyboardType="numeric"
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />

      <Text>Country</Text>
      <TextInput
        value={form.country}
        onChangeText={(text) => setForm({ ...form, country: text })}
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
      />

      <Button title="Save Changes" onPress={handleSave} />
    </View>
  );
}
