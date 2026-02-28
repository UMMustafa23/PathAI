import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ScoreEntry = { date: string; score: number; explanation?: string };

const SCORE_LABELS: Record<string, string> = {
  "0–200":   "Getting started",
  "201–400": "Building momentum",
  "401–600": "On track",
  "601–800": "Strong alignment",
  "801–1000":"Top alignment",
};

function scoreLabel(s: number) {
  if (s <= 200)  return SCORE_LABELS["0–200"];
  if (s <= 400)  return SCORE_LABELS["201–400"];
  if (s <= 600)  return SCORE_LABELS["401–600"];
  if (s <= 800)  return SCORE_LABELS["601–800"];
  return SCORE_LABELS["801–1000"];
}

function scoreColor(s: number) {
  if (s <= 200)  return "#48474D";
  if (s <= 400)  return "#5E5CE6";
  if (s <= 600)  return "#30D158";
  if (s <= 800)  return "#FFD60A";
  return "#FFFFFF";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AssessmentLog() {
  const router = useRouter();
  const [loading, setLoading]   = useState(true);
  const [user, setUser]         = useState<any>(null);
  const [history, setHistory]   = useState<ScoreEntry[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
      const cache = await AsyncStorage.getItem("score_cache");
      if (cache) {
        const { history: h } = JSON.parse(cache);
        if (Array.isArray(h)) setHistory([...h].reverse());
      }
      setLoading(false);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Assessment Log</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current assessment result */}
        <Text style={styles.sectionLabel}>Latest assessment result</Text>
        {user?.assessmentResult ? (
          <View style={styles.resultCard}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={24} color="#5E5CE6" />
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={styles.resultTitle}>{user.assessmentResult}</Text>
              {user.selectedCareer?.title ? (
                <Text style={styles.resultSub}>Matched career: {user.selectedCareer.title}</Text>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No assessment completed yet.</Text>
          </View>
        )}

        {/* Big Five scores */}
        {user?.bigFiveScores && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: 28 }]}>Personality profile</Text>
            {Object.entries(user.bigFiveScores as Record<string, number>).map(([trait, score]) => (
              <View key={trait} style={styles.traitRow}>
                <Text style={styles.traitName}>{trait.charAt(0).toUpperCase() + trait.slice(1)}</Text>
                <View style={styles.traitBarBg}>
                  <View style={[styles.traitBarFill, { width: `${Math.min(100, Math.round(score * 100))}%` as any }]} />
                </View>
                <Text style={styles.traitScore}>{Math.round(score * 100)}%</Text>
              </View>
            ))}
          </>
        )}

        {/* Alignment score history */}
        <Text style={[styles.sectionLabel, { marginTop: 28 }]}>Alignment score history</Text>
        {loading ? (
          <ActivityIndicator color="white" style={{ marginTop: 20 }} />
        ) : history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No score history yet. Visit the dashboard to generate your first score.</Text>
          </View>
        ) : (
          history.map((entry, i) => (
            <TouchableOpacity key={i} style={styles.entryCard} onPress={() => setExpanded(prev => prev === i ? null : i)}>
              <View style={styles.entryHeader}>
                <View style={[styles.scoreBadge, { backgroundColor: scoreColor(entry.score) + "22", borderColor: scoreColor(entry.score) + "55" }]}>
                  <Text style={[styles.scoreValue, { color: scoreColor(entry.score) }]}>{entry.score}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.entryLabel}>{scoreLabel(entry.score)}</Text>
                  <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                </View>
                <Ionicons name={expanded === i ? "chevron-up" : "chevron-down"} size={16} color="#8E8E93" />
              </View>
              {expanded === i && entry.explanation ? (
                <Text style={styles.entryExplanation}>{entry.explanation}</Text>
              ) : null}
            </TouchableOpacity>
          ))
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
  resultCard: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#161618", borderRadius: 18, padding: 18 },
  resultTitle: { color: "white", fontSize: 15, fontWeight: "600", lineHeight: 22 },
  resultSub: { color: "#8E8E93", fontSize: 13, marginTop: 4 },
  emptyCard: { backgroundColor: "#161618", borderRadius: 18, padding: 20, alignItems: "center" },
  emptyText: { color: "#8E8E93", fontSize: 14, textAlign: "center", lineHeight: 20 },
  traitRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  traitName: { color: "#8E8E93", fontSize: 13, width: 100 },
  traitBarBg: { flex: 1, height: 6, backgroundColor: "#2C2C2E", borderRadius: 3, overflow: "hidden" },
  traitBarFill: { height: 6, backgroundColor: "#5E5CE6", borderRadius: 3 },
  traitScore: { color: "white", fontSize: 13, width: 42, textAlign: "right" },
  entryCard: { backgroundColor: "#161618", borderRadius: 18, padding: 16, marginBottom: 10 },
  entryHeader: { flexDirection: "row", alignItems: "center" },
  scoreBadge: { width: 56, height: 56, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  scoreValue: { fontSize: 18, fontWeight: "700" },
  entryLabel: { color: "white", fontSize: 14, fontWeight: "600" },
  entryDate: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
  entryExplanation: { color: "#A0A0A8", fontSize: 14, lineHeight: 22, marginTop: 12 },
});
