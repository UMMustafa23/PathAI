import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function Results() {
  const { answers } = useLocalSearchParams();
  const parsed = JSON.parse(answers as string);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>
        Your Career Suggestions
      </Text>

      <Text>Your answers:</Text>
      <Text>{JSON.stringify(parsed, null, 2)}</Text>

      <Text style={{ marginTop: 20 }}>
        (Next: we will add AI suggestions here)
      </Text>
    </View>
  );
}
