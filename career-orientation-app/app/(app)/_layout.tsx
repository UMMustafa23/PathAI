import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { TouchableOpacity, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AppLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const stored = await AsyncStorage.getItem("user");
      const isLogged = !!stored;

      setLoggedIn(isLogged);
      setLoading(false);

      const inProtectedArea = segments[0] === "(app)";

      if (!isLogged && inProtectedArea) {
        router.replace("/login");
      }
    };

    checkUser();
  }, [segments]);

  if (loading) return null;

  return (
    <Stack
      screenOptions={{
        headerRight: () =>
          loggedIn ? (
            <TouchableOpacity onPress={() => router.push("/(app)/profile")}>
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                }}
                style={{
                  width: 32,
                  height: 32,
                  marginRight: 15,
                  borderRadius: 16,
                }}
              />
            </TouchableOpacity>
          ) : null,
      }}
    />
  );
}
