import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Dimensions, ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const CHART_W = width - 48;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function daysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n); return d;
}
function shortDay(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return ["Su","Mo","Tu","We","Th","Fr","Sa"][d.getDay()];
}

const MOOD_COLORS = ["#FFFFFF", "#8E8E93", "#3A3A3C"]; // Great, Okay, Rough
const MOOD_LABELS = ["Great", "Okay", "Rough"];

type Task = { id: string; completed: boolean; date?: string };
type ScorePoint = { date: string; score: number };

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function BarChart({ values, labels, color, maxVal }: {
  values: number[]; labels: string[]; color: (v: number) => string; maxVal: number;
}) {
  const BAR_W = Math.max(4, Math.floor((CHART_W - (values.length - 1) * 3) / values.length));
  const H = 80;
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", height: H + 20, gap: 3 }}>
      {values.map((v, i) => {
        const h = maxVal > 0 ? Math.max(3, Math.round((v / maxVal) * H)) : 3;
        return (
          <View key={i} style={{ alignItems: "center", width: BAR_W }}>
            <View style={{ width: BAR_W, height: h, backgroundColor: color(v), borderRadius: 3 }} />
            <Text style={styles.chartLabel}>{labels[i]}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Score sparkline ─────────────────────────────────────────────────────────
function Sparkline({ data }: { data: ScorePoint[] }) {
  if (data.length === 0) return <View style={{ height: 60 }} />;
  const scores = data.map(p => p.score);
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  const span = max - min || 1;
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", height: 60, gap: 3, marginTop: 12 }}>
      {data.map((p, i) => {
        const h = Math.max(3, Math.round(((p.score - min) / span) * 60));
        const isLast = i === data.length - 1;
        return (
          <View key={i} style={{
            flex: 1, height: h,
            backgroundColor: isLast ? "#FFFFFF" : "#3A3A3C",
            borderRadius: 2,
            opacity: isLast ? 1 : 0.5 + (i / data.length) * 0.5,
          }} />
        );
      })}
    </View>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, color }: {
  label: string; value: string | number; sub?: string; icon: any; color: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + "22" }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Analytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // raw data
  const [user, setUser]               = useState<any>(null);
  const [goalsData, setGoalsData]     = useState<number[]>([]);   // last 14 days completed count
  const [goalsDays, setGoalsDays]     = useState<string[]>([]);
  const [moodData, setMoodData]       = useState<number[]>([]);   // 0/1/2 per day
  const [moodDays, setMoodDays]       = useState<string[]>([]);
  const [scoreHistory, setScoreHistory] = useState<ScorePoint[]>([]);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [scoreDelta, setScoreDelta]   = useState(0);
  const [streak, setStreak]           = useState(0);
  const [totalTasksAdded, setTotalTasksAdded]     = useState(0);
  const [totalTasksDone, setTotalTasksDone]       = useState(0);
  const [weekTasksDone, setWeekTasksDone]         = useState(0);
  const [weekGoalsPct, setWeekGoalsPct]           = useState(0);
  const [bestMood, setBestMood]       = useState(0); // most common mood index

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // ── User ──
      const rawUser = await AsyncStorage.getItem("user");
      const u = rawUser ? JSON.parse(rawUser) : {};
      setUser(u);

      // ── All AsyncStorage keys ──
      const allKeys = await AsyncStorage.getAllKeys();

      // ── Goals (last 30 days) ──
      const goalKeys = allKeys.filter(k => k.startsWith("goals_checked_"));
      const goalPairs = await AsyncStorage.multiGet(goalKeys);
      const goalMap: Record<string, number> = {};
      for (const [k, v] of goalPairs) {
        if (v) {
          const dk = k.replace("goals_checked_", "");
          const arr: boolean[] = JSON.parse(v);
          goalMap[dk] = arr.filter(Boolean).length;
        }
      }

      // 14-day arrays
      const g14: number[] = [];
      const gLabels14: string[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = daysAgo(i);
        const dk = dateKey(d);
        g14.push(goalMap[dk] ?? 0);
        gLabels14.push(i % 2 === 0 ? shortDay(dk) : "");
      }
      setGoalsData(g14);
      setGoalsDays(gLabels14);

      // week goals pct (last 7 days)
      const weekGoalsTotal = g14.slice(7).reduce((a, b) => a + b, 0);
      setWeekGoalsPct(Math.round((weekGoalsTotal / 35) * 100)); // 7 days × 5 goals

      // streak calc
      let s = 0;
      for (let i = 0; i < 365; i++) {
        const dk = dateKey(daysAgo(i));
        const c = goalMap[dk] ?? 0;
        if (c >= 5) s++;
        else break;
      }
      setStreak(s);

      // ── Mood (last 14 days) ──
      const moodKeys = allKeys.filter(k => k.startsWith("mood_"));
      const moodPairs = await AsyncStorage.multiGet(moodKeys);
      const moodMap: Record<string, number> = {};
      for (const [k, v] of moodPairs) {
        if (v !== null) moodMap[k.replace("mood_", "")] = parseInt(v);
      }
      const m14: number[] = [];
      const mLabels14: string[] = [];
      const moodCounts = [0, 0, 0];
      for (let i = 13; i >= 0; i--) {
        const d = daysAgo(i);
        const dk = dateKey(d);
        const mv = moodMap[dk] ?? 1;
        m14.push(mv);
        mLabels14.push(i % 2 === 0 ? shortDay(dk) : "");
        moodCounts[mv]++;
      }
      setMoodData(m14);
      setMoodDays(mLabels14);
      setBestMood(moodCounts.indexOf(Math.max(...moodCounts)));

      // ── Score cache ──
      const cached = await AsyncStorage.getItem("score_cache");
      if (cached) {
        const c = JSON.parse(cached);
        setLatestScore(c.score ?? null);
        setScoreDelta(c.delta ?? 0);
        const hist: ScorePoint[] = Array.isArray(c.history) ? c.history : [];
        setScoreHistory(hist.slice(-30));
      }

      // ── Planner tasks ──
      const plannerRaw = await AsyncStorage.getItem("planner_tasks");
      if (plannerRaw) {
        const plannerAll: Record<string, Task[]> = JSON.parse(plannerRaw);
        let added = 0, done = 0, wDone = 0;
        const today = new Date();
        for (const [dk, tasks] of Object.entries(plannerAll)) {
          added += tasks.length;
          done  += tasks.filter(t => t.completed).length;
          const d = new Date(dk + "T12:00:00");
          const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
          if (diff >= 0 && diff < 7) wDone += tasks.filter(t => t.completed).length;
        }
        setTotalTasksAdded(added);
        setTotalTasksDone(done);
        setWeekTasksDone(wDone);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // ── Derived ──
  const taskRate = totalTasksAdded > 0 ? Math.round((totalTasksDone / totalTasksAdded) * 100) : 0;
  const big5 = user?.bigFiveScores as Record<string, number> | undefined;
  const careerTitle = user?.selectedCareer?.title ?? user?.selectedCareer ?? null;
  const uniName = user?.selectedUniversity?.name ?? user?.selectedUniversity ?? null;

  // ── Insight message ──
  function insight() {
    if (!latestScore) return "Complete your daily goals to start building analytics.";
    if (latestScore >= 800) return "Outstanding alignment. You're on track for your career goals.";
    if (latestScore >= 600) return "Strong progress. Keep up the consistent daily effort.";
    if (latestScore >= 400) return "Good momentum. Try to complete more daily goals for a score boost.";
    if (streak > 0) return `${streak}-day streak active. Aim to complete all 5 goals to grow faster.`;
    return "Start a streak by completing all 5 goals today. Every day counts.";
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={load} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Building your analytics…</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* ── Career label ── */}
          {(careerTitle || uniName) && (
            <View style={styles.careerBadge}>
              <MaterialCommunityIcons name="briefcase-outline" size={14} color="#8E8E93" />
              <Text style={styles.careerBadgeText} numberOfLines={1}>
                {careerTitle ?? uniName}
                {careerTitle && uniName ? `  ·  ${uniName}` : ""}
              </Text>
            </View>
          )}

          {/* ── Insight card ── */}
          <View style={styles.insightCard}>
            <Text style={styles.insightEmoji}>
              {latestScore == null ? "📊" : latestScore >= 700 ? "🚀" : latestScore >= 400 ? "📈" : "💡"}
            </Text>
            <Text style={styles.insightText}>{insight()}</Text>
          </View>

          {/* ── Stat row ── */}
          <View style={styles.statRow}>
            <StatCard label="Streak"   value={streak}          sub="days"  icon="flame-outline"       color="#FFFFFF" />
            <StatCard label="Score"    value={latestScore ?? "—"} sub={scoreDelta !== 0 ? `${scoreDelta > 0 ? "+" : ""}${scoreDelta}` : undefined} icon="trending-up-outline" color="#FFFFFF" />
            <StatCard label="Week"     value={`${weekGoalsPct}%`}  sub="goals" icon="checkmark-circle-outline" color="#FFFFFF" />
            <StatCard label="Tasks"    value={weekTasksDone}   sub="this wk" icon="list-outline"        color="#FFFFFF" />
          </View>

          {/* ── Goals completion (14 days) ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Goal completions</Text>
              <Text style={styles.cardSub}>last 14 days</Text>
            </View>
            <BarChart
              values={goalsData}
              labels={goalsDays}
              color={(v) => {
                if (v === 0) return "#2C2C2E";
                if (v < 3)  return "#3A3A3C";
                if (v < 5)  return "#8E8E93";
                return "#FFFFFF";
              }}
              maxVal={5}
            />
            <View style={styles.legendRow}>
              {[["0","#2C2C2E"],["1-2","#3A3A3C"],["3-4","#8E8E93"],["5","#FFFFFF"]].map(([l, c]) => (
                <View key={l} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: c }]} />
                  <Text style={styles.legendLabel}>{l}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Mood history ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Mood history</Text>
              <Text style={styles.cardSub}>last 14 days</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 12 }}>
              {moodData.map((m, i) => (
                <View key={i} style={{ flex: 1, alignItems: "center", gap: 4 }}>
                  <View style={[styles.moodPill, { backgroundColor: MOOD_COLORS[m] + "33", borderColor: MOOD_COLORS[m] }]}>
                    <Text style={{ fontSize: 10, color: MOOD_COLORS[m], fontWeight: "700" }}>
                      {["G","O","R"][m]}
                    </Text>
                  </View>
                  <Text style={styles.chartLabel}>{moodDays[i]}</Text>
                </View>
              ))}
            </View>
            <View style={styles.legendRow}>
              {MOOD_LABELS.map((l, i) => (
                <View key={l} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: MOOD_COLORS[i] }]} />
                  <Text style={styles.legendLabel}>{l}</Text>
                </View>
              ))}
              <View style={{ flex: 1 }} />
              <Text style={styles.cardSub}>Most common: <Text style={{ color: "#FFFFFF" }}>{MOOD_LABELS[bestMood]}</Text></Text>
            </View>
          </View>

          {/* ── Alignment score trend ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Alignment score</Text>
              {latestScore != null && (
                <View style={[styles.scorePill, { backgroundColor: "#2C2C2E" }]}>
                  <Text style={[styles.scorePillText, { color: "#FFFFFF" }]}>{latestScore}</Text>
                </View>
              )}
            </View>
            {scoreHistory.length > 1 ? (
              <>
                <Sparkline data={scoreHistory} />
                <View style={styles.scoreRange}>
                  <Text style={styles.cardSub}>Low: {Math.min(...scoreHistory.map(p => p.score))}</Text>
                  <Text style={styles.cardSub}>
                    {scoreDelta !== 0 && (
                      <Text style={{ color: "#FFFFFF" }}>
                        {scoreDelta > 0 ? "↑ " : "↓ "}{Math.abs(scoreDelta)} pts
                      </Text>
                    )}{" "}from last
                  </Text>
                  <Text style={styles.cardSub}>High: {Math.max(...scoreHistory.map(p => p.score))}</Text>
                </View>
              </>
            ) : (
              <Text style={[styles.cardSub, { marginTop: 12, textAlign: "center" }]}>
                Visit the dashboard daily to build a score history.
              </Text>
            )}
          </View>

          {/* ── Task productivity ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Planner productivity</Text>
              <Text style={styles.cardSub}>all time</Text>
            </View>
            <View style={styles.taskStatsRow}>
              <View style={styles.taskStatBox}>
                <Text style={styles.taskStatVal}>{totalTasksAdded}</Text>
                <Text style={styles.taskStatLabel}>Tasks added</Text>
              </View>
              <View style={[styles.taskStatBox, styles.taskStatBorder]}>
                <Text style={styles.taskStatVal}>{totalTasksDone}</Text>
                <Text style={styles.taskStatLabel}>Completed</Text>
              </View>
              <View style={styles.taskStatBox}>
                <Text style={styles.taskStatVal}>
                  {taskRate}%
                </Text>
                <Text style={styles.taskStatLabel}>Rate</Text>
              </View>
            </View>
            {/* Completion rate bar */}
            <View style={styles.rateBarBg}>
              <View style={[styles.rateBarFill, {
                width: `${taskRate}%` as any,
                backgroundColor: "#FFFFFF",
              }]} />
            </View>
          </View>

          {/* ── Personality profile ── */}
          {big5 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Personality profile</Text>
                <MaterialCommunityIcons name="brain" size={16} color="#8E8E93" />
              </View>
              {Object.entries(big5).map(([trait, score]) => (
                <View key={trait} style={styles.traitRow}>
                  <Text style={styles.traitName}>{trait.charAt(0).toUpperCase() + trait.slice(1)}</Text>
                  <View style={styles.traitBarBg}>
                    <View style={[styles.traitBarFill, {
                      width: `${Math.min(100, Math.round(score * 100))}%` as any,
                      backgroundColor: "#FFFFFF",
                    }]} />
                  </View>
                  <Text style={styles.traitPct}>{Math.round(score * 100)}%</Text>
                </View>
              ))}
            </View>
          )}

          {/* ── Development milestones ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Development milestones</Text>
            <View style={{ marginTop: 14, gap: 12 }}>
              <Milestone done={!!user?.assessmentCompleted}  label="Career assessment completed" />
              <Milestone done={!!careerTitle}                label="Career path selected" />
              <Milestone done={!!uniName}                    label="University chosen" />
              <Milestone done={streak >= 3}                  label="3-day goal streak" />
              <Milestone done={streak >= 7}                  label="7-day goal streak" />
              <Milestone done={weekGoalsPct >= 60}           label="60%+ weekly goal completion" />
              <Milestone done={taskRate >= 50}               label="50%+ task completion rate" />
              <Milestone done={(latestScore ?? 0) >= 600}    label="Alignment score ≥ 600" />
              <Milestone done={(latestScore ?? 0) >= 800}    label="Alignment score ≥ 800" />
            </View>
          </View>

        </ScrollView>
      )}

      {/* ── Nav Bar ── */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.push("/dashboard")}>
          <MaterialCommunityIcons name="view-grid-outline" size={26} color="#444" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/planner")}>
          <Ionicons name="calendar-outline" size={24} color="#444" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="stats-chart" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/chatbot")}>
          <MaterialCommunityIcons name="comment-text-outline" size={24} color="#444" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Milestone row ────────────────────────────────────────────────────────────
function Milestone({ done, label }: { done: boolean; label: string }) {
  return (
    <View style={styles.milestoneRow}>
      <View style={[styles.milestoneCheck, done && styles.milestoneCheckDone]}>
        {done && <Ionicons name="checkmark" size={12} color="black" />}
      </View>
      <Text style={[styles.milestoneLabel, !done && { color: "#48474D" }]}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0B" },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 10 },
  headerTitle: { color: "white", fontSize: 22, fontWeight: "700" },
  refreshBtn: { padding: 6 },

  loadingBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText: { color: "#8E8E93", fontSize: 15 },

  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120 },

  careerBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#1C1C1E", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, alignSelf: "flex-start", marginBottom: 14, borderWidth: 1, borderColor: "#3A3A3C" },
  careerBadgeText: { color: "#8E8E93", fontSize: 12, fontWeight: "600", maxWidth: width - 100 },

  insightCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#161618", borderRadius: 18, padding: 18, marginBottom: 14 },
  insightEmoji: { fontSize: 30 },
  insightText: { color: "#D1D1D6", fontSize: 14, lineHeight: 22, flex: 1 },

  // Stats
  statRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: "#161618", borderRadius: 16, padding: 12, alignItems: "center", gap: 4 },
  statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  statValue: { color: "white", fontSize: 17, fontWeight: "700" },
  statLabel: { color: "#8E8E93", fontSize: 11 },
  statSub: { color: "#48474D", fontSize: 10 },

  // Card
  card: { backgroundColor: "#161618", borderRadius: 20, padding: 18, marginBottom: 14 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cardTitle: { color: "white", fontSize: 15, fontWeight: "600" },
  cardSub: { color: "#48474D", fontSize: 12 },

  // Charts
  chartLabel: { color: "#48474D", fontSize: 9, marginTop: 3 },
  legendRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10, marginTop: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { color: "#8E8E93", fontSize: 11 },

  // Mood
  moodPill: { width: "100%" as any, aspectRatio: 1, borderRadius: 6, alignItems: "center", justifyContent: "center", borderWidth: 1 },

  // Score
  scorePill: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  scorePillText: { fontSize: 14, fontWeight: "700" },
  scoreRange: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },

  // Tasks
  taskStatsRow: { flexDirection: "row", marginTop: 12 },
  taskStatBox: { flex: 1, alignItems: "center" },
  taskStatBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#2C2C2E" },
  taskStatVal: { color: "white", fontSize: 22, fontWeight: "700" },
  taskStatLabel: { color: "#8E8E93", fontSize: 12, marginTop: 3 },
  rateBarBg: { height: 6, backgroundColor: "#2C2C2E", borderRadius: 3, marginTop: 16, overflow: "hidden" },
  rateBarFill: { height: 6, borderRadius: 3 },

  // Personality
  traitRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  traitName: { color: "#8E8E93", fontSize: 12, width: 110 },
  traitBarBg: { flex: 1, height: 5, backgroundColor: "#2C2C2E", borderRadius: 3, overflow: "hidden" },
  traitBarFill: { height: 5, borderRadius: 3 },
  traitPct: { color: "white", fontSize: 12, width: 38, textAlign: "right" },

  // Milestones
  milestoneRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  milestoneCheck: { width: 22, height: 22, borderRadius: 6, backgroundColor: "#2C2C2E", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#3A3A3C" },
  milestoneCheckDone: { backgroundColor: "#FFFFFF", borderColor: "#FFFFFF" },
  milestoneLabel: { color: "white", fontSize: 14, fontWeight: "500" },

  // Nav
  navBar: { position: "absolute", bottom: 0, width, height: 90, backgroundColor: "#000", flexDirection: "row", justifyContent: "space-around", alignItems: "center", borderTopWidth: 1, borderTopColor: "#1C1C1E", paddingBottom: 20 },
});
