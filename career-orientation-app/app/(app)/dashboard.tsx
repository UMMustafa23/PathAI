import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [traits, setTraits] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem("user");
      if (!stored) return;

      const parsed = JSON.parse(stored);
      setUser(parsed);

      if (!parsed.assessmentCompleted) {
        router.replace("/assessment");
        return;
      }

      // Fetch personality results
      try {
        const res = await fetch(
          "http://172.20.10.4:3000/getResults?email=" + parsed.email
        );
        const data = await res.json();
        setTraits(data.traits);
      } catch (err) {
        console.log("Failed to load results:", err);
      }

      setLoading(false);
    };

    load();
  }, []);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 26, fontFamily: "Poppins_700Bold" }}>
        Welcome back, {user.username}
      </Text>

      <Text style={{ marginTop: 10, fontSize: 16 }}>
        Here are your personality results:
      </Text>

      {!traits ? (
        <Text style={{ marginTop: 20, fontSize: 16 }}>
          No results found. Please complete the assessment.
        </Text>
      ) : (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.trait}>Extraversion: {traits.Extraversion}</Text>
          <Text style={styles.trait}>Agreeableness: {traits.Agreeableness}</Text>
          <Text style={styles.trait}>
            Conscientiousness: {traits.Conscientiousness}
          </Text>
          <Text style={styles.trait}>Neuroticism: {traits.Neuroticism}</Text>
          <Text style={styles.trait}>Openness: {traits.Openness}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = {
  trait: {
    fontSize: 18,
    marginVertical: 8,
    fontFamily: "Poppins_500Medium",
  },
};
