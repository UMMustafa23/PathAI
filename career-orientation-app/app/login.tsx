import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Input from "./components/Input";
import GradientButton from "./components/GradientButton";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields.");
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
        alert(data.error || "Invalid credentials");
      }
    } catch (err) {
      alert("Network error. Try again later.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to continue your career journey</Text>
      </View>

      <View style={styles.form}>
        <Input placeholder="Email" value={email} onChangeText={setEmail} />
        <Input placeholder="Password" secure value={password} onChangeText={setPassword} />

        <GradientButton title="Log In" onPress={handleLogin} />

        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={styles.link}>
            Don’t have an account? <Text style={styles.linkBold}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5FA",
    paddingHorizontal: 28,
    justifyContent: "center",
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: "Poppins_700Bold",
    color: "#1F1F39",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "#6B6B6B",
    textAlign: "center",
    marginTop: 6,
  },
  form: {
    width: "100%",
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#6B6B6B",
    fontFamily: "Poppins_400Regular",
  },
  linkBold: {
    color: "#6C63FF",
    fontFamily: "Poppins_600SemiBold",
  },
});
