import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Switch, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Settings() {
  const router = useRouter();

  const [notifGoals,   setNotifGoals]   = useState(true);
  const [notifStreak,  setNotifStreak]  = useState(true);
  const [notifScore,   setNotifScore]   = useState(false);
  const [notifTips,    setNotifTips]    = useState(true);
  const [reminderTime, setReminderTime] = useState("8:00 AM");

  // Load persisted settings
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("app_settings");
      if (saved) {
        const s = JSON.parse(saved);
        if (s.notifGoals   != null) setNotifGoals(s.notifGoals);
        if (s.notifStreak  != null) setNotifStreak(s.notifStreak);
        if (s.notifScore   != null) setNotifScore(s.notifScore);
        if (s.notifTips    != null) setNotifTips(s.notifTips);
        if (s.reminderTime != null) setReminderTime(s.reminderTime);
      }
    })();
  }, []);

  const save = async (patch: object) => {
    const saved = await AsyncStorage.getItem("app_settings");
    const current = saved ? JSON.parse(saved) : {};
    await AsyncStorage.setItem("app_settings", JSON.stringify({ ...current, ...patch }));
  };

  const toggle = (key: string, val: boolean, setter: (v: boolean) => void) => {
    setter(val);
    save({ [key]: val });
  };

  const clearCache = () => {
    Alert.alert("Clear cache", "This will remove cached score data and chat sessions. Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(["score_cache", "chat_sessions"]);
          Alert.alert("Done", "Cache cleared.");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.card}>
          <ToggleRow label="Daily goal reminders"  sub="Remind me to check my goals"          value={notifGoals}  onToggle={v => toggle("notifGoals", v, setNotifGoals)} />
          <Divider />
          <ToggleRow label="Streak alerts"          sub="Alert when streak is at risk"          value={notifStreak} onToggle={v => toggle("notifStreak", v, setNotifStreak)} />
          <Divider />
          <ToggleRow label="Score updates"          sub="Notify when alignment score changes"   value={notifScore}  onToggle={v => toggle("notifScore", v, setNotifScore)} />
          <Divider />
          <ToggleRow label="Career tips"            sub="Weekly career development insights"    value={notifTips}   onToggle={v => toggle("notifTips", v, setNotifTips)} />
        </View>

        {/* Reminder time */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Daily reminder time</Text>
        <View style={styles.card}>
          {["7:00 AM", "8:00 AM", "9:00 AM", "6:00 PM", "8:00 PM"].map(t => (
            <TouchableOpacity
              key={t}
              style={styles.timeOption}
              onPress={() => { setReminderTime(t); save({ reminderTime: t }); }}
            >
              <Text style={[styles.timeLabel, reminderTime === t && { color: "white" }]}>{t}</Text>
              {reminderTime === t && <Ionicons name="checkmark" size={18} color="#5E5CE6" />}
            </TouchableOpacity>
          ))}
        </View>

        {/* App */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>App</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={clearCache}>
            <Text style={styles.actionLabel}>Clear cache</Text>
            <Ionicons name="trash-outline" size={18} color="#8E8E93" />
          </TouchableOpacity>
          <Divider />
          <View style={styles.actionRow}>
            <Text style={styles.actionLabel}>App version</Text>
            <Text style={styles.actionValue}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ToggleRow = ({ label, sub, value, onToggle }: { label: string; sub: string; value: boolean; onToggle: (v: boolean) => void }) => (
  <View style={styles.toggleRow}>
    <View style={{ flex: 1, paddingRight: 12 }}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Text style={styles.toggleSub}>{sub}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: "#2C2C2E", true: "#5E5CE6" }}
      thumbColor="white"
    />
  </View>
);

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0B" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, height: 60 },
  back: { padding: 4 },
  title: { color: "white", fontSize: 18, fontWeight: "600" },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 50 },
  sectionLabel: { color: "#444", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12, marginLeft: 2 },
  card: { backgroundColor: "#161618", borderRadius: 18, overflow: "hidden" },
  toggleRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 14 },
  toggleLabel: { color: "white", fontSize: 15, fontWeight: "500", marginBottom: 2 },
  toggleSub: { color: "#8E8E93", fontSize: 12 },
  divider: { height: 1, backgroundColor: "#2C2C2E", marginLeft: 18 },
  timeOption: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#2C2C2E" },
  timeLabel: { color: "#8E8E93", fontSize: 15 },
  actionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 16 },
  actionLabel: { color: "white", fontSize: 15, fontWeight: "500" },
  actionValue: { color: "#8E8E93", fontSize: 14 },
});
