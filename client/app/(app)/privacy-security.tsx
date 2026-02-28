import React, { useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Alert, Modal,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../../constants/api";

export default function PrivacySecurity() {
  const router = useRouter();
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext]       = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving]   = useState(false);

  const changePassword = async () => {
    if (!current || !next)   return Alert.alert("Error", "Fill in all fields.");
    if (next !== confirm)     return Alert.alert("Error", "New passwords do not match.");
    if (next.length < 6)      return Alert.alert("Error", "Password must be at least 6 characters.");
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res   = await fetch(`${API_URL}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const json = await res.json();
      if (res.ok) {
        Alert.alert("Success", "Password changed.");
        setCurrent(""); setNext(""); setConfirm("");
        setShowChangePwd(false);
      } else {
        Alert.alert("Error", json.message ?? "Could not change password.");
      }
    } catch {
      Alert.alert("Error", "Could not reach server.");
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = () => {
    Alert.alert(
      "Delete account",
      "This will permanently delete your account and all your data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await fetch(`${API_URL}/delete-account`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });
            } finally {
              await AsyncStorage.clear();
              router.replace("/login");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy & Security</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Security */}
        <Text style={styles.sectionLabel}>Security</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => setShowChangePwd(true)}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: "#5E5CE622" }]}>
                <Ionicons name="key-outline" size={20} color="#5E5CE6" />
              </View>
              <View>
                <Text style={styles.rowLabel}>Change password</Text>
                <Text style={styles.rowSub}>Update your account password</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#444" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: "#30D15822" }]}>
                <Ionicons name="lock-closed-outline" size={20} color="#30D158" />
              </View>
              <View>
                <Text style={styles.rowLabel}>JWT authentication</Text>
                <Text style={styles.rowSub}>Sessions are token-secured</Text>
              </View>
            </View>
            <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>Active</Text></View>
          </View>
        </View>

        {/* Data & privacy */}
        <Text style={[styles.sectionLabel, { marginTop: 26 }]}>Data & Privacy</Text>
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="shield-lock-outline" size={24} color="#5E5CE6" style={{ marginBottom: 10 }} />
          <Text style={styles.infoTitle}>How we handle your data</Text>
          <Text style={styles.infoText}>
            PathAI stores your assessment results, career preferences, and usage statistics on a secure MongoDB server.
            {"\n\n"}Passwords are hashed using bcrypt and are never stored in plain text. All API communication is authenticated via JWT tokens with expiry.
            {"\n\n"}Your personality scores, selected career, daily goals, and streak data are used solely to personalise your in-app experience and are never sold to third parties.
            {"\n\n"}You can request full deletion of your account and all associated data at any time using the button below.
          </Text>
        </View>

        {/* Danger zone */}
        <Text style={[styles.sectionLabel, { marginTop: 26 }]}>Danger zone</Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={deleteAccount}>
          <Ionicons name="trash-outline" size={20} color="#FF453A" />
          <Text style={styles.deleteText}>Delete my account</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Change password modal */}
      <Modal visible={showChangePwd} transparent animationType="slide" onRequestClose={() => setShowChangePwd(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowChangePwd(false)} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Change password</Text>
            <Text style={styles.inputLabel}>Current password</Text>
            <TextInput style={styles.input} secureTextEntry placeholder="••••••••" placeholderTextColor="#48474D" value={current} onChangeText={setCurrent} />
            <Text style={styles.inputLabel}>New password</Text>
            <TextInput style={styles.input} secureTextEntry placeholder="••••••••" placeholderTextColor="#48474D" value={next} onChangeText={setNext} />
            <Text style={styles.inputLabel}>Confirm new password</Text>
            <TextInput style={styles.input} secureTextEntry placeholder="••••••••" placeholderTextColor="#48474D" value={confirm} onChangeText={setConfirm} />
            <TouchableOpacity
              style={[styles.saveBtn, (saving || !current || !next || !confirm) && { opacity: 0.4 }]}
              onPress={changePassword}
              disabled={saving || !current || !next || !confirm}
            >
              <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Update password"}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0B" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, height: 60 },
  back: { padding: 4 },
  title: { color: "white", fontSize: 18, fontWeight: "600" },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 50 },
  sectionLabel: { color: "#444", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12, marginLeft: 2 },
  card: { backgroundColor: "#161618", borderRadius: 18, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconCircle: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowLabel: { color: "white", fontSize: 15, fontWeight: "500" },
  rowSub: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
  activeBadge: { backgroundColor: "#30D15822", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  activeBadgeText: { color: "#30D158", fontSize: 12, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#2C2C2E", marginLeft: 18 },
  infoCard: { backgroundColor: "#161618", borderRadius: 18, padding: 20 },
  infoTitle: { color: "white", fontSize: 16, fontWeight: "600", marginBottom: 10 },
  infoText: { color: "#A0A0A8", fontSize: 14, lineHeight: 22 },
  deleteBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#331111" },
  deleteText: { color: "#FF453A", fontSize: 16, fontWeight: "600" },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: { backgroundColor: "#111113", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#2C2C2E", alignSelf: "center", marginBottom: 20 },
  sheetTitle: { color: "white", fontSize: 20, fontWeight: "700", marginBottom: 20 },
  inputLabel: { color: "#8E8E93", fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: "#1C1C1E", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, color: "white", fontSize: 16, marginBottom: 14, borderWidth: 1, borderColor: "#2C2C2E" },
  saveBtn: { backgroundColor: "#FFFFFF", borderRadius: 16, height: 52, alignItems: "center", justifyContent: "center", marginTop: 4 },
  saveBtnText: { color: "black", fontSize: 16, fontWeight: "700" },
});
