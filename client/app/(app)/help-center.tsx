import React, { useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, LayoutAnimation, Platform, UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";

if (Platform.OS === "android") UIManager.setLayoutAnimationEnabledExperimental?.(true);

const FAQ: { q: string; a: string }[] = [
  {
    q: "How does the career assessment work?",
    a: "The assessment analyzes your Big Five personality traits, interests, and academic strengths. Based on your answers, PathAI matches you with careers that align with your profile using a weighted scoring algorithm.",
  },
  {
    q: "How is my alignment score calculated?",
    a: "Your alignment score (0–1000) is computed from four factors: career match strength (40%), completed tasks in the last 7 days (30%), your current streak (20%), and 30-day consistency (10%). It updates every time you visit the dashboard.",
  },
  {
    q: "Can I change my chosen career or university?",
    a: "Yes. Retake the assessment from the dashboard or update your choices in Career Orientation under your profile. Your goals and score will automatically adapt to your new selection.",
  },
  {
    q: "What does the streak counter track?",
    a: "Your streak increments every day you complete at least one goal. Completing all goals for the day earns a full-glow indicator on your calendar. Missing a day resets the streak.",
  },
  {
    q: "How does the mood affect my goals?",
    a: "On Great days (mood = Great), PathAI shows ambitious, deep-work goals. On Okay days, standard career goals are shown. On Rough days, easier, low-pressure goals are suggested. Changing your mood regenerates the goals for that day.",
  },
  {
    q: "Is my data stored securely?",
    a: "Yes. Your data is stored in a secure MongoDB database. Passwords are hashed with bcrypt, and all API calls require a JWT token. See Privacy & Security for more details.",
  },
  {
    q: "How do I use the AI chatbot?",
    a: "Tap the chat icon in the bottom navigation. The AI career coach knows your chosen career and university, so you can ask career-specific questions, get CV tips, or request study advice. Each conversation is saved as a separate session.",
  },
  {
    q: "What is the 'Help with organization' button in the planner?",
    a: "After adding tasks for the day, tap 'Help with organization' to send your task list to the AI. It will suggest an optimized time-blocked schedule based on your workload.",
  },
  {
    q: "How do I contact support?",
    a: "Use the Feedback screen (Profile → Support → Feedback) to send us a message. We typically respond within 1–2 business days.",
  },
];

export default function HelpCenter() {
  const router = useRouter();
  const [open, setOpen] = useState<number | null>(null);

  const toggle = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(prev => (prev === i ? null : i));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Help Center</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Frequently asked questions</Text>

        {FAQ.map((item, i) => (
          <TouchableOpacity key={i} style={styles.card} onPress={() => toggle(i)} activeOpacity={0.8}>
            <View style={styles.cardHeader}>
              <Text style={styles.question}>{item.q}</Text>
              <Ionicons name={open === i ? "chevron-up" : "chevron-down"} size={18} color="#8E8E93" />
            </View>
            {open === i && <Text style={styles.answer}>{item.a}</Text>}
          </TouchableOpacity>
        ))}

        <View style={styles.contactBox}>
          <Ionicons name="mail-outline" size={22} color="#5E5CE6" style={{ marginBottom: 8 }} />
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactSub}>{"Send us a message via the Feedback screen and we'll get back to you."}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0B" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, height: 60 },
  back: { padding: 4 },
  title: { color: "white", fontSize: 18, fontWeight: "600" },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 50 },
  subtitle: { color: "#8E8E93", fontSize: 13, marginBottom: 16, marginLeft: 2 },
  card: { backgroundColor: "#161618", borderRadius: 18, padding: 18, marginBottom: 10 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  question: { color: "white", fontSize: 15, fontWeight: "600", flex: 1, lineHeight: 22 },
  answer: { color: "#A0A0A8", fontSize: 14, lineHeight: 22, marginTop: 12 },
  contactBox: { backgroundColor: "#161618", borderRadius: 18, padding: 20, marginTop: 8, alignItems: "center" },
  contactTitle: { color: "white", fontSize: 16, fontWeight: "600", marginBottom: 6 },
  contactSub: { color: "#8E8E93", fontSize: 14, textAlign: "center", lineHeight: 20 },
});
