import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Input from "./components/Input" ;
import GradientButton from "./components/GradientButton";


export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch("http://172.20.10.4:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        await AsyncStorage.setItem("token", data.token);

        router.replace("/(app)/dashboard");
      } else {
        Alert.alert("Login Failed", data.error || "Invalid credentials");
      }
    } catch (err) {
      Alert.alert("Network Error", "Could not connect to server.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Log in to continue your journey</Text>

      <Input placeholder="Email" value={email} onChangeText={setEmail} />
      <Input placeholder="Password" secure value={password} onChangeText={setPassword} />

      <GradientButton title="Log In" onPress={handleLogin} />

      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={styles.link}>Don’t have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
    backgroundColor: "#F7F7FC",
  },
  title: {
    fontSize: 32,
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    color: "#6B6B6B",
    marginBottom: 30,
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#6C63FF",
    fontFamily: "Poppins_600SemiBold",
  },
});
