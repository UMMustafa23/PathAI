import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons, Feather, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveToServer } from "../../utils/sync";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await saveToServer();
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    router.replace("/login");
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "white" }}>No user logged in</Text>
          <TouchableOpacity
            style={[styles.logoutButton, { marginTop: 20 }]}
            onPress={() => router.replace("/login")}
          >
            <Text style={styles.logoutText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.editButton}>
          <Feather name="edit-3" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: "https://via.placeholder.com/150" }}
              style={styles.avatar}
            />
            <View style={styles.onlineBadge} />
          </View>
          <Text style={styles.userName}>{user.username}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user.age || "--"}</Text>
            <Text style={styles.statLabel}>Age</Text>
          </View>
          <View style={[styles.statBox, styles.statBorder]}>
            <Text style={styles.statValue}>{user.country || "--"}</Text>
            <Text style={styles.statLabel}>Country</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user.assessmentCompleted ? "Done" : "No"}</Text>
            <Text style={styles.statLabel}>Assessment</Text>
          </View>
        </View>

        {(user.selectedCareer || user.selectedUniversity) && (
          <TouchableOpacity
            style={styles.careerCard}
            onPress={() => router.push("/(app)/career-orientation")}
          >
            <View style={styles.careerCardLeft}>
              <MaterialCommunityIcons name="briefcase-outline" size={22} color="#5E5CE6" />
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={styles.careerCardTitle} numberOfLines={1}>
                  {user.selectedCareer?.title ?? "Career chosen"}
                </Text>
                {user.selectedUniversity?.name ? (
                  <Text style={styles.careerCardSub} numberOfLines={1}>
                    {user.selectedUniversity.name}
                  </Text>
                ) : null}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#444" />
          </TouchableOpacity>
        )}

        <View style={styles.menuContainer}>
          <Text style={styles.sectionLabel}>Account</Text>
          <MenuButton icon="person-outline"           label="Personal Information"  onPress={() => {}} />
          <MenuButton icon="notifications-outline"    label="Notifications"         onPress={() => router.push("/(app)/settings")} />
          <MenuButton icon="shield-checkmark-outline" label="Privacy & Security"    onPress={() => router.push("/(app)/privacy-security")} />
          <MenuButton icon="settings-outline"         label="Settings"              onPress={() => router.push("/(app)/settings")} />

          <Text style={[styles.sectionLabel, { marginTop: 22 }]}>Career</Text>
          <MenuButton icon="bar-chart-outline" label="Assessment Log"     onPress={() => router.push("/(app)/assessment-log")} />
          <MenuButton icon="briefcase-outline" label="Career Orientation" onPress={() => router.push("/(app)/career-orientation")} />

          <Text style={[styles.sectionLabel, { marginTop: 22 }]}>Support</Text>
          <MenuButton icon="help-circle-outline" label="Help Center" onPress={() => router.push("/(app)/help-center")} />
          <MenuButton icon="chatbubble-outline"  label="Feedback"    onPress={() => router.push("/(app)/feedback")} />

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color="#FF453A" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const MenuButton = ({
  icon, label, onPress,
}: { icon: any; label: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuLeft}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={20} color="#AAA" />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#444" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 60,
  },
  backButton: { padding: 5 },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "600" },
  editButton: { padding: 5 },
  scrollContent: { paddingBottom: 40 },
  avatarSection: { alignItems: "center", marginTop: 20 },
  imageContainer: { position: "relative" },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "#1C1C1E",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#34C759",
    borderWidth: 3,
    borderColor: "#000",
  },
  userName: { color: "white", fontSize: 24, fontWeight: "bold", marginTop: 15 },
  userEmail: { color: "#8E8E93", fontSize: 14, marginTop: 4 },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#161618",
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 20,
    paddingVertical: 20,
  },
  statBox: { flex: 1, alignItems: "center" },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#2C2C2E" },
  statValue: { color: "white", fontSize: 18, fontWeight: "bold" },
  statLabel: { color: "#8E8E93", fontSize: 12, marginTop: 4 },
  careerCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#161618", marginHorizontal: 20, marginTop: 14,
    borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "#2C2C2E",
  },
  careerCardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  careerCardTitle: { color: "white", fontSize: 15, fontWeight: "600" },
  careerCardSub: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
  menuContainer: { marginTop: 28, paddingHorizontal: 20 },
  sectionLabel: {
    color: "#444",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#161618",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  menuLeft: { flexDirection: "row", alignItems: "center" },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#242426",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuLabel: { color: "white", fontSize: 16, fontWeight: "500" },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#331111",
  },
  logoutText: { color: "#FF453A", fontSize: 16, fontWeight: "bold", marginLeft: 10 },
});
