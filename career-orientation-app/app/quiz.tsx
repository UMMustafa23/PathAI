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

  const handleAnswer = (answer: string) => {
    setAnswers([...answers, answer]);

    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      router.push({
        pathname: "./results",
        params: { answers: JSON.stringify([...answers, answer]) },
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
