import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, Text, View } from "react-native";

const questions = [
  {
    q: "Do you enjoy solving logical problems?",
    options: ["Yes", "No"],
  },
  {
    q: "Do you prefer working with people or machines?",
    options: ["People", "Machines"],
  },
];

export default function Quiz() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const saveAssessment = async (finalAnswers: string[]) => {
    try {
      const res = await fetch("http://172.26.79.79:3000/saveAssessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com", // временно
          answers: finalAnswers,
          score: finalAnswers.length
        })
      });

      const data = await res.json();
      console.log("Saved assessment:", data);
    } catch (err) {
      console.log("Error saving assessment:", err);
    }
  };

  const handleAnswer = async (answer: string) => {
    const updatedAnswers = [...answers, answer];
    setAnswers(updatedAnswers);

    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      await saveAssessment(updatedAnswers);

      router.push({
        pathname: "./results",
        params: { answers: JSON.stringify(updatedAnswers) },
      });
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>
        {questions[index].q}
      </Text>

      {questions[index].options.map((opt) => (
        <Button key={opt} title={opt} onPress={() => handleAnswer(opt)} />
      ))}
    </View>
  );
}
