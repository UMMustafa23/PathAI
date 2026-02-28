import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TRAIT_ICONS: Record<string, string> = {
  openness: "lightbulb-outline",
  conscientiousness: "checkmark-done-outline",
  extraversion: "people-outline",
  agreeableness: "heart-outline",
  neuroticism: "pulse-outline",
};

export default function CareerOrientation() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    })();
  }, []);

  if (!user) return null;

  const career     = user.selectedCareer;
  const university = user.selectedUniversity;
  const big5       = user.bigFiveScores as Record<string, number> | undefined;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Career Orientation</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ── Career card ── */}
        <Text style={styles.sectionLabel}>Chosen career</Text>
        {career ? (
          <View style={styles.bigCard}>
            <View style={styles.bigCardIcon}>
              <MaterialCommunityIcons name="briefcase-outline" size={28} color="#5E5CE6" />
            </View>
            <Text style={styles.bigCardTitle}>{career.title}</Text>
            {career.description ? (
              <Text style={styles.bigCardDesc}>{career.description}</Text>
            ) : null}
            {career.skills?.length > 0 && (
              <View style={styles.tagRow}>
                {career.skills.slice(0, 6).map((s: string, i: number) => (
                  <View key={i} style={styles.tag}><Text style={styles.tagText}>{s}</Text></View>
                ))}
              </View>
            )}
            {career.matchScore != null && (
              <View style={styles.matchRow}>
                <Text style={styles.matchLabel}>Match score</Text>
                <Text style={styles.matchValue}>{career.matchScore}%</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No career selected. Complete the assessment to get a match.</Text>
          </View>
        )}

        {/* ── University card ── */}
        <Text style={[styles.sectionLabel, { marginTop: 26 }]}>Chosen university</Text>
        {university ? (
          <View style={styles.uniCard}>
            <MaterialCommunityIcons name="school-outline" size={22} color="#30D158" />
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={styles.uniName}>{university.name}</Text>
              {university.country ? <Text style={styles.uniSub}>{university.country}</Text> : null}
              {university.program ? <Text style={styles.uniSub}>{university.program}</Text> : null}
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No university selected.</Text>
          </View>
        )}

        {/* ── Personality alignment ── */}
        {big5 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: 26 }]}>Your personality profile</Text>
            {Object.entries(big5).map(([trait, score]) => (
              <View key={trait} style={styles.traitRow}>
                <Ionicons name={(TRAIT_ICONS[trait] ?? "ellipse-outline") as any} size={18} color="#5E5CE6" style={{ width: 26 }} />
                <Text style={styles.traitName}>{trait.charAt(0).toUpperCase() + trait.slice(1)}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${Math.min(100, Math.round(score * 100))}%` as any }]} />
                </View>
                <Text style={styles.traitPct}>{Math.round(score * 100)}%</Text>
              </View>
            ))}
          </>
        )}

        {/* ── Assessment result ── */}
        {user.assessmentResult && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: 26 }]}>Assessment summary</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>{user.assessmentResult}</Text>
            </View>
          </>
        )}
      </ScrollView>
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
  bigCard: { backgroundColor: "#161618", borderRadius: 20, padding: 22 },
  bigCardIcon: { width: 52, height: 52, borderRadius: 14, backgroundColor: "#5E5CE622", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  bigCardTitle: { color: "white", fontSize: 20, fontWeight: "700", marginBottom: 8 },
  bigCardDesc: { color: "#A0A0A8", fontSize: 14, lineHeight: 22, marginBottom: 14 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 14 },
  tag: { backgroundColor: "#2C2C2E", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { color: "#D1D1D6", fontSize: 12 },
  matchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#2C2C2E", paddingTop: 14 },
  matchLabel: { color: "#8E8E93", fontSize: 14 },
  matchValue: { color: "#30D158", fontSize: 20, fontWeight: "700" },
  uniCard: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#161618", borderRadius: 18, padding: 18 },
  uniName: { color: "white", fontSize: 15, fontWeight: "600" },
  uniSub: { color: "#8E8E93", fontSize: 13, marginTop: 3 },
  emptyCard: { backgroundColor: "#161618", borderRadius: 18, padding: 20, alignItems: "center" },
  emptyText: { color: "#8E8E93", fontSize: 14, textAlign: "center", lineHeight: 20 },
  traitRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  traitName: { color: "#8E8E93", fontSize: 13, width: 120 },
  barBg: { flex: 1, height: 6, backgroundColor: "#2C2C2E", borderRadius: 3, overflow: "hidden" },
  barFill: { height: 6, backgroundColor: "#5E5CE6", borderRadius: 3 },
  traitPct: { color: "white", fontSize: 13, width: 42, textAlign: "right" },
  summaryCard: { backgroundColor: "#161618", borderRadius: 18, padding: 18 },
  summaryText: { color: "#D1D1D6", fontSize: 14, lineHeight: 22 },
});
