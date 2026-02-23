import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import Input from "./components/Input";
import GradientButton from "./components/GradientButton";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Signup() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!username || !email || !password) {
      Alert.alert("Missing fields", "Username, email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://172.20.10.4:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          country,
          age,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        router.replace("/(app)/assessment");
      } else {
        Alert.alert("Signup Failed", data.error || "Something went wrong.");
      }
    } catch (err) {
      Alert.alert("Network Error", "Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Let’s personalize your career journey</Text>
      </View>

      <View style={styles.form}>
        <Input placeholder="Username" value={username} onChangeText={setUsername} />
        <Input placeholder="Email" value={email} onChangeText={setEmail} />
        <Input placeholder="Password" secure value={password} onChangeText={setPassword} />
        <Input placeholder="Country" value={country} onChangeText={setCountry} />
        <Input placeholder="Age" value={age} onChangeText={setAge} />

        <GradientButton
          title={loading ? "Signing up..." : "Sign Up"}
          onPress={handleSignup}
        />

        <TouchableOpacity onPress={() => router.push("./login")}>
          <Text style={styles.link}>
            Already have an account? <Text style={styles.linkBold}>Log in</Text>
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
    marginBottom: 35,
  },
  title: {
    fontSize: 30,
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
