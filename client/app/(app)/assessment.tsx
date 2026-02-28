import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../../constants/api";

interface Question {
  _id: string;
  question: string;
  options: string[];
}

const LABELS = ["Very\nInaccurate", "Moderately\nInaccurate", "Neither", "Moderately\nAccurate", "Very\nAccurate"];

export default function CareerAssessment() {
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await fetch(`${API_URL}/questions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch questions");
        setQuestions(data);
      } catch (err: any) {
        Alert.alert("Error", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No questions found.{"\n"}Please check your connection and try again.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.replace("/assessment")}>
          <Text style={styles.navBtnText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const question = questions[current];
  const total = questions.length;
  const progress = total > 0 ? (current + 1) / total : 0;
  const selected = answers[question._id];
  const isLast = current === total - 1;
  const canAdvance = selected !== undefined;

  const handleSelect = (score: number) => {
    setAnswers((prev) => ({ ...prev, [question._id]: score }));
  };

  const handleNext = () => {
    if (current < total - 1) setCurrent((c) => c + 1);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  const handleFinish = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_URL}/assessment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || "Failed to save assessment");
      }

      router.replace("/results");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSaving(false);
    }
  };

  if (saving) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Analyzing your results…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Counter */}
      <View style={styles.counterRow}>
        <Text style={styles.counterText}>
          {current + 1} <Text style={styles.counterTotal}>/ {total}</Text>
        </Text>
      </View>

      {/* Question card */}
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>

      {/* Answer options */}
      <View style={styles.answersContainer}>
        {[1, 2, 3, 4, 5].map((score, i) => (
          <TouchableOpacity
            key={score}
            style={[styles.answerBtn, selected === score && styles.answerBtnActive]}
            onPress={() => handleSelect(score)}
            activeOpacity={0.85}
          >
            <View style={[styles.scoreBox, selected === score && styles.scoreBoxActive]}>
              <Text style={[styles.scoreNum, selected === score && styles.scoreNumActive]}>
                {score}
              </Text>
            </View>
            <Text style={[styles.answerLabel, selected === score && styles.answerLabelActive]}>
              {LABELS[i]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navBtn, styles.navBtnBack, current === 0 && styles.navBtnDisabled]}
          onPress={handlePrev}
          disabled={current === 0}
        >
          <Text style={styles.navBtnBackText}>← Back</Text>
        </TouchableOpacity>

        {isLast ? (
          <TouchableOpacity
            style={[styles.navBtn, styles.navBtnFinish, !canAdvance && styles.navBtnDisabled]}
            onPress={handleFinish}
            disabled={!canAdvance}
          >
            <Text style={styles.navBtnText}>Finish</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navBtn, styles.navBtnNext, !canAdvance && styles.navBtnDisabled]}
            onPress={handleNext}
            disabled={!canAdvance}
          >
            <Text style={styles.navBtnText}>Next →</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0B" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A0B",
    gap: 20,
  },
  loadingText: { color: "white", fontSize: 16, textAlign: "center", lineHeight: 26 },
  retryBtn: {
    marginTop: 24,
    backgroundColor: "white",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 26,
  },
  // Progress
  progressTrack: { height: 3, backgroundColor: "#2C2C2E" },
  progressFill: { height: 3, backgroundColor: "white", borderRadius: 2 },
  // Counter
  counterRow: {
    paddingHorizontal: 28,
    paddingTop: 22,
    paddingBottom: 10,
    alignItems: "flex-end",
  },
  counterText: { color: "white", fontSize: 22, fontWeight: "700" },
  counterTotal: { color: "#555", fontSize: 16, fontWeight: "400" },
  // Question
  questionCard: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 32,
    backgroundColor: "#161618",
    borderRadius: 24,
    padding: 28,
    minHeight: 150,
    justifyContent: "center",
  },
  questionText: { color: "white", fontSize: 20, fontWeight: "500", lineHeight: 30, marginTop: 4 },
  // Answers
  answersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 36,
  },
  answerBtn: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 10,
    borderRadius: 14,
  },
  answerBtnActive: { backgroundColor: "#1C1C1E" },
  scoreBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  scoreBoxActive: { backgroundColor: "white" },
  scoreNum: { color: "#8E8E93", fontSize: 16, fontWeight: "700" },
  scoreNumActive: { color: "black" },
  answerLabel: { color: "#555", fontSize: 9, textAlign: "center", lineHeight: 13 },
  answerLabelActive: { color: "#EBEBF5" },
  // Navigation
  navRow: { flexDirection: "row", paddingHorizontal: 24, gap: 12 },
  navBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  navBtnBack: { backgroundColor: "#1C1C1E", flex: 0.5 },
  navBtnNext: { backgroundColor: "white" },
  navBtnFinish: { backgroundColor: "white" },
  navBtnDisabled: { opacity: 0.25 },
  navBtnText: { color: "black", fontSize: 16, fontWeight: "700" },
  navBtnBackText: { color: "#8E8E93", fontSize: 16, fontWeight: "600" },
});