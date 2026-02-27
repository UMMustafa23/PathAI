import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../../constants/api";

interface Question {
  _id: string;
  text: string;
}

export default function CareerAssessment() {
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔥 Fetch questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        const response = await fetch(`${API_URL}/questions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch questions");
        }

        setQuestions(data);
      } catch (err: any) {
        Alert.alert("Error", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleSelect = (questionId: string, index: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: index }));
  };

  const isComplete = questions.length > 0 && Object.keys(answers).length === questions.length;

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
        throw new Error(data.error || "Failed to save");
      }

      router.replace("/results");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text style={styles.title}>Career assessment</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {questions.map((q) => (
          <View key={q._id} style={styles.questionCard}>
            <Text style={styles.questionText}>{q.text}</Text>

            <View style={styles.iconRow}>
              {[0, 1, 2, 3, 4].map((i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.moodCircle,
                    answers[q._id] === i && styles.moodCircleActive,
                  ]}
                  onPress={() => handleSelect(q._id, i)}
                >
                  <View
                    style={[
                      styles.mouthBase,
                      i === 0 && styles.mouthHappy,
                      i === 1 && styles.mouthSmile,
                      i === 2 && styles.mouthNeutral,
                      i === 3 && styles.mouthFrown,
                      i === 4 && styles.mouthSad,
                      answers[q._id] === i && styles.mouthActive,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[
            styles.finishBtn,
            (!isComplete || saving) && styles.finishBtnDisabled,
          ]}
          onPress={handleFinish}
          disabled={!isComplete || saving}
        >
          <Text style={styles.finishBtnText}>
            {saving ? "Saving..." : "Finish Assessment"}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="black" />
        </TouchableOpacity>
      </ScrollView>
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
  },
  header: { paddingHorizontal: 25, paddingTop: 20, marginBottom: 10 },
  title: { color: "white", fontSize: 28, fontWeight: "600" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  questionCard: {
    backgroundColor: "#161618",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
  },
  questionText: { color: "white", fontSize: 16, marginBottom: 20 },
  iconRow: { flexDirection: "row", justifyContent: "space-between" },
  moodCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
  },
  moodCircleActive: { backgroundColor: "white" },
  mouthBase: { width: 20, borderBottomWidth: 2, borderColor: "#8E8E93" },
  mouthActive: { borderColor: "black" },
  mouthHappy: { height: 10, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
  mouthSmile: { height: 6, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
  mouthNeutral: { height: 0, marginBottom: 4 },
  mouthFrown: {
    height: 6,
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: 8,
  },
  mouthSad: {
    height: 10,
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: 12,
  },
  finishBtn: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 18,
    borderRadius: 30,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  finishBtnDisabled: { opacity: 0.3 },
  finishBtnText: {
    color: "black",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 6,
  },
});