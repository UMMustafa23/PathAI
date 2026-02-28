import React, { useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../../constants/api";

const CATEGORIES = [
  { id: "bug",        label: "Bug report",       icon: "bug-outline" },
  { id: "feature",    label: "Feature request",  icon: "bulb-outline" },
  { id: "career",     label: "Career content",   icon: "briefcase-outline" },
  { id: "general",    label: "General feedback", icon: "chatbubble-outline" },
];

const RATINGS = ["😞", "😐", "🙂", "😊", "🤩"];

export default function Feedback() {
  const router = useRouter();
  const [category, setCategory] = useState("general");
  const [rating,   setRating]   = useState<number | null>(null);
  const [message,  setMessage]  = useState("");
  const [email,    setEmail]    = useState("");
  const [sending,  setSending]  = useState(false);
  const [sent,     setSent]     = useState(false);

  const canSend = message.trim().length >= 10 && rating != null;

  const send = async () => {
    if (!canSend) return;
    setSending(true);
    try {
      const userRaw = await AsyncStorage.getItem("user");
      const user    = userRaw ? JSON.parse(userRaw) : {};
      const token   = await AsyncStorage.getItem("token");

      const body = {
        category,
        ratingIndex: rating,
        ratingEmoji: RATINGS[rating!],
        message: message.trim(),
        replyEmail: email.trim() || user.email || "",
        username: user.username ?? "Anonymous",
        timestamp: new Date().toISOString(),
      };

      // Try to send to server; gracefully degrade if endpoint doesn't exist yet
      try {
        await fetch(`${API_URL}/feedback`, {
          method:  "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body:    JSON.stringify(body),
        });
      } catch {
        // server offline — still show success; data could be queued locally
      }

      setSent(true);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Feedback</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.sentContainer}>
          <Text style={styles.sentEmoji}>🎉</Text>
          <Text style={styles.sentTitle}>Thank you!</Text>
          <Text style={styles.sentSub}>Your feedback helps us improve PathAI. We really appreciate it.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => { setSent(false); setMessage(""); setRating(null); setCategory("general"); setEmail(""); }}>
            <Text style={styles.doneBtnText}>Send more feedback</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Back to profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Feedback</Text>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Category */}
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.catCard, category === c.id && styles.catCardActive]}
                onPress={() => setCategory(c.id)}
              >
                <Ionicons name={c.icon as any} size={20} color={category === c.id ? "white" : "#8E8E93"} />
                <Text style={[styles.catLabel, category === c.id && { color: "white" }]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rating */}
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>How happy are you with PathAI?</Text>
          <View style={styles.ratingRow}>
            {RATINGS.map((emoji, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.ratingBtn, rating === i && styles.ratingBtnActive]}
                onPress={() => setRating(i)}
              >
                <Text style={styles.ratingEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Message */}
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Your message</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Tell us what you think, what's broken, or what feature you'd love to see…"
            placeholderTextColor="#48474D"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={message}
            onChangeText={setMessage}
          />
          <Text style={styles.charCount}>{message.trim().length} / 10 min</Text>

          {/* Optional email */}
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Reply email (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor="#48474D"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* Send */}
          <TouchableOpacity
            style={[styles.sendBtn, (!canSend || sending) && { opacity: 0.4 }]}
            onPress={send}
            disabled={!canSend || sending}
          >
            {sending
              ? <ActivityIndicator color="black" />
              : (
                <>
                  <MaterialCommunityIcons name="send" size={18} color="black" />
                  <Text style={styles.sendBtnText}>Send feedback</Text>
                </>
              )
            }
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0B" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, height: 60 },
  back: { padding: 4 },
  title: { color: "white", fontSize: 18, fontWeight: "600" },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 50 },
  sectionLabel: { color: "#444", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12, marginLeft: 2 },

  // Category
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  catCard: { flexBasis: "47%", flexGrow: 1, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#161618", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#2C2C2E" },
  catCardActive: { borderColor: "#5E5CE6", backgroundColor: "#5E5CE622" },
  catLabel: { color: "#8E8E93", fontSize: 13, fontWeight: "500", flex: 1 },

  // Rating
  ratingRow: { flexDirection: "row", justifyContent: "space-between" },
  ratingBtn: { width: 56, height: 56, borderRadius: 16, backgroundColor: "#161618", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#2C2C2E" },
  ratingBtnActive: { borderColor: "#5E5CE6", backgroundColor: "#5E5CE622" },
  ratingEmoji: { fontSize: 26 },

  // Inputs
  messageInput: { backgroundColor: "#161618", borderRadius: 16, padding: 16, color: "white", fontSize: 15, minHeight: 120, borderWidth: 1, borderColor: "#2C2C2E", lineHeight: 22 },
  charCount: { color: "#444", fontSize: 12, marginTop: 6, textAlign: "right" },
  input: { backgroundColor: "#161618", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, color: "white", fontSize: 16, borderWidth: 1, borderColor: "#2C2C2E" },

  // Send
  sendBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#FFFFFF", borderRadius: 16, height: 54, marginTop: 24 },
  sendBtnText: { color: "black", fontSize: 16, fontWeight: "700" },

  // Sent
  sentContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
  sentEmoji: { fontSize: 64, marginBottom: 20 },
  sentTitle: { color: "white", fontSize: 26, fontWeight: "700", marginBottom: 10 },
  sentSub: { color: "#8E8E93", fontSize: 15, textAlign: "center", lineHeight: 24, marginBottom: 36 },
  doneBtn: { backgroundColor: "#FFFFFF", borderRadius: 16, paddingHorizontal: 28, paddingVertical: 14, marginBottom: 12 },
  doneBtnText: { color: "black", fontSize: 16, fontWeight: "700" },
  backBtn: { paddingVertical: 12 },
  backBtnText: { color: "#5E5CE6", fontSize: 15 },
});
