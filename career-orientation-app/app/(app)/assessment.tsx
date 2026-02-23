import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import GradientButton from "../components/GradientButton";

const OPTIONS = [
  { label: "Strongly Disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly Agree", value: 5 },
];

export default function Assessment() {
  const router = useRouter();

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Load user
  useEffect(() => {
    AsyncStorage.getItem("user").then((u) => {
      if (u) setUser(JSON.parse(u));
    });
  }, []);

  // Load questions from backend
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await fetch("http://172.20.10.4:3000/questions");
        const data = await res.json();

        setQuestions(data.questions);
        setAnswers(Array(data.questions.length).fill(null));
      } catch (err) {
        Alert.alert("Error", "Failed to load questions.");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  const handleSelect = (index: number, value: number) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) {
      Alert.alert("Incomplete", "Please answer all questions.");
      return;
    }

    try {
      // 1️⃣ SCORE ANSWERS
      const scoreRes = await fetch("http://172.20.10.4:3000/scoreAssessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const { traits } = await scoreRes.json();

      // 2️⃣ SAVE RESULTS
      await fetch("http://172.20.10.4:3000/saveResults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          traits,
        }),
      });

      // 3️⃣ UPDATE LOCAL USER (THIS FIXES THE REDIRECT LOOP)
      const updatedUser = { ...user, assessmentCompleted: true };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      // 4️⃣ GO TO DASHBOARD
      router.replace("/(app)/dashboard");

    } catch (err) {
      Alert.alert("Error", "Failed to submit assessment.");
    }
  };

  if (loading || !questions.length || !answers.length || !user) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Career Orientation Assessment</Text>

      {questions.map((q, i) => (
        <View key={i} style={styles.questionCard}>
          <Text style={styles.question}>{i + 1}. {q.text}</Text>

          <View style={styles.optionsRow}>
            {OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.circle,
                  answers[i] === opt.value && styles.circleSelected,
                ]}
                onPress={() => handleSelect(i, opt.value)}
              >
                {answers[i] === opt.value && <View style={styles.innerCircle} />}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.labelsRow}>
            <Text style={styles.label}>Strongly Disagree</Text>
            <Text style={styles.label}>Strongly Agree</Text>
          </View>
        </View>
      ))}

      <GradientButton title="Submit Assessment" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F4F5FA" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 26,
    fontFamily: "Poppins_700Bold",
    marginBottom: 20,
    textAlign: "center",
  },
  questionCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  question: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    marginBottom: 15,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
  },
  circleSelected: {
    backgroundColor: "#6C63FF",
  },
  innerCircle: {
    width: 12,
    height: 12,
    backgroundColor: "#fff",
    borderRadius: 6,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 12,
    color: "#777",
    fontFamily: "Poppins_400Regular",
  },
});
