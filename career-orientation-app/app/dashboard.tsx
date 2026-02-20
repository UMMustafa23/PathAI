import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    };
    loadUser();
  }, []);

  if (!user) return <Text>Loading...</Text>;

  return (
    <View style={{ padding: 20 }}>
      <TouchableOpacity
        style={{ position: "absolute", top: 40, right: 20 }}
        onPress={() => router.push("/profile")}
      >
        <Image
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
      </TouchableOpacity>

      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Welcome, {user.username}!</Text>
      <Text>Email: {user.email}</Text>
      <Text>Country: {user.country}</Text>
      <Text>Age: {user.age}</Text>
    </View>
  );
}
