import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL  from "../constants/api";

export default function AuthScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isLogin ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [isLogin]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 106],
  });

  const handleAuth = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

     const data = await res.json();

if (!res.ok) {
  throw new Error(data.error || "Login failed");
}

await AsyncStorage.setItem("token", data.token);

router.replace("/assessment");
    } catch (err) {
      alert("Could not connect to server");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.toggleWrapper}>
            <View style={styles.toggleBackground}>
              <Animated.View
                style={[styles.slidingBg, { transform: [{ translateX }] }]}
              />
              <TouchableOpacity
                style={styles.toggleBtn}
                onPress={() => {
                  setIsLogin(true);
                  router.replace("/login");
                }}
              >
                <Text
                  style={[styles.toggleText, isLogin && styles.activeTabText]}
                >
                  Log In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.toggleBtn}
                onPress={() => {
                  setIsLogin(false);
                  router.replace("/signup");
                }}
              >
                <Text
                  style={[styles.toggleText, !isLogin && styles.activeTabText]}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.fullInput}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#444"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.fullInput}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholderTextColor="#444"
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.mainBtn} onPress={handleAuth}>
            <Text style={styles.mainBtnText}>Log In</Text>
            <Ionicons name="chevron-forward" size={20} color="black" />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 60,
    alignItems: "center",
    paddingBottom: 40,
  },
  toggleWrapper: { marginBottom: 50 },
  toggleBackground: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    width: 214,
    height: 48,
    borderRadius: 24,
    padding: 4,
    position: "relative",
  },
  slidingBg: {
    position: "absolute",
    backgroundColor: "#FFF",
    width: 104,
    height: 40,
    borderRadius: 20,
    top: 4,
  },
  toggleBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  toggleText: { color: "#8E8E93", fontSize: 14, fontWeight: "600" },
  activeTabText: { color: "#000" },
  formContainer: { width: "100%", gap: 15 },
  fullInput: { width: "100%" },
  label: { color: "#FFF", fontSize: 13, marginBottom: 8, marginLeft: 4 },
  input: {
    backgroundColor: "#1C1C1E",
    color: "#FFF",
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 15,
  },
  mainBtn: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 25,
    marginTop: 50,
    alignItems: "center",
    gap: 8,
  },
  mainBtnText: { color: "#000", fontSize: 16, fontWeight: "700" },
});
