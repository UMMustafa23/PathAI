import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../../constants/api';

const { width } = Dimensions.get('window');

// ---------- Goal bank --------------------------------------------------
// NORMAL — standard daily goals
const GOAL_TEMPLATES = [
  'Read one article about {career} trends and take notes',
  'Watch a 20-min tutorial related to {career} skills',
  'Update or review your {career} portfolio/resume section',
  'Connect with one professional in the {career} field on LinkedIn',
  'Complete one practice problem or exercise in {career}',
  'Research admission requirements for {university}',
  'Write 3 bullet points about why you chose {career}',
  'Explore one open-course related to {career} on Coursera / edX',
  'Set a 30-min focused study block on a {career} topic',
  'Review your weekly progress toward your {career} goal',
  'Look up scholarship opportunities at {university}',
  'Outline your 6-month roadmap toward entering {career}',
  'Find and save one useful resource about {university}',
  'Practise one soft skill important in {career} (e.g. communication)',
  'Identify one gap in your {career} knowledge and plan how to fill it',
  'Research top companies hiring in {career} and bookmark 3',
  'Learn one new tool or technology used in {career}',
  'Draft one question you would ask a professional in {career}',
  'Review the core subjects required for {career}',
  'Spend 15 minutes journaling your motivation for pursuing {career}',
  'Look into extracurricular clubs at {university} relevant to {career}',
  'Complete one section of a {career}-related online certification',
];

// EASY — gentle, low-effort goals for rough days
const GOAL_TEMPLATES_EASY = [
  'Spend 5 minutes reading one headline about {career}',
  'Watch a short 5-min video related to {career}',
  'Write one sentence about what excites you in {career}',
  'Look at one job listing in {career} — just to stay familiar',
  'Take a 10-minute walk and think about your {career} goals',
  'Spend 5 minutes browsing {university}\'s website',
  'Listen to a short podcast episode about {career} (or read a summary)',
  'Review your notes or bookmarks related to {career}',
  'Write down one small thing you\'re proud of in your {career} journey',
  'Send a friendly message to someone in {career} or reply to one',
  'Spend 10 minutes on something {career}-related that feels easy',
  'Read the bio of one person working in {career} for inspiration',
  'Jot down one question you have about {career} to explore later',
  'Take a breath and remind yourself why {career} matters to you',
  'Spend 5 minutes tidying your study space to prepare for tomorrow',
];

// AMBITIOUS — deeper, higher-effort goals for great days
const GOAL_TEMPLATES_AMBITIOUS = [
  'Complete two practice problems or exercises in {career}',
  'Build or update a project related to {career} — push to GitHub',
  'Write a LinkedIn post about your progress in {career}',
  'Reach out to 2 professionals in {career} for informational interviews',
  'Finish one full module of a {career} online course',
  'Draft a personal statement paragraph for {university}',
  'Review and revise your entire {career} portfolio section',
  'Study one advanced concept in {career} and write a summary',
  'Spend 90 focused minutes on a deep {career} skill session',
  'Research 5 companies hiring in {career} and rank your top picks',
  'Identify and close one specific skill gap relevant to {career}',
  'Outline a 3-month action plan for your {career} path',
  'Read a full article or chapter related to {career} and take structured notes',
  'Set up or improve your professional online profile for {career}',
  'Practice a mock interview question relevant to {career} out loud',
];

type MoodLevel = 0 | 1 | 2; // 0=Great, 1=Okay, 2=Rough

function getTemplatePool(mood: MoodLevel) {
  if (mood === 2) return GOAL_TEMPLATES_EASY;
  if (mood === 0) return GOAL_TEMPLATES_AMBITIOUS;
  return GOAL_TEMPLATES;
}

function getDailyGoals(career: string, university: string, dateKey: string, mood: MoodLevel = 1): string[] {
  let seed = 0;
  for (let i = 0; i < dateKey.length; i++) seed = (seed * 31 + dateKey.charCodeAt(i)) >>> 0;
  // shift seed by mood so each level gives different goals
  seed = (seed + mood * 7919) >>> 0;

  const pool = getTemplatePool(mood).map(t => fillTemplate(t, career, university));
  const selected: string[] = [];
  const available = [...pool];
  for (let i = 0; i < Math.min(5, available.length); i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const idx = seed % available.length;
    selected.push(available.splice(idx, 1)[0]);
  }
  return selected;
}
// -----------------------------------------------------------------------

function fillTemplate(template: string, career: string, university: string): string {
  return template
    .replace(/{career}/g, career || 'your career')
    .replace(/{university}/g, university || 'your university');
}

// ---------- Streak calendar helpers ------------------------------------
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// 6 levels: 0 goals → darkest, 5 goals → white
const COMPLETION_COLORS = ['#48474D','#3E3D6A','#514FA0','#7070C0','#A0A0D8','#FFFFFF'];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function dateKeyForDay(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function dotColor(count: number): string {
  return COMPLETION_COLORS[Math.min(Math.max(count, 0), 5)];
}
// -----------------------------------------------------------------------

// ---------- Mini sparkline (bar chart, no external libs) ---------------
type ScorePoint = { date: string; score: number; explanation?: string };

function Sparkline({ data, range }: { data: ScorePoint[]; range: number }) {
  const pts = data.slice(-range);
  if (pts.length === 0) return <View style={{ height: 52 }} />;
  const scores = pts.map(p => p.score);
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  const span = max - min || 1;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 52, gap: 2, marginVertical: 14 }}>
      {pts.map((p, i) => {
        const h = Math.max(3, Math.round(((p.score - min) / span) * 52));
        const isLast = i === pts.length - 1;
        return (
          <View
            key={i}
            style={{
              flex: 1,
              height: h,
              backgroundColor: isLast ? '#FFFFFF' : '#3E3D6A',
              borderRadius: 2,
              opacity: isLast ? 1 : 0.6 + (i / pts.length) * 0.4,
            }}
          />
        );
      })}
    </View>
  );
}
// -----------------------------------------------------------------------

export default function Dashboard() {
  const router = useRouter();
  const todayKey = new Date().toISOString().slice(0, 10);

  const [moodIndex, setMoodIndex] = useState<MoodLevel>(1);
  const moodStorageKey = `mood_${todayKey}`;
  const moods: { label: string; mouthStyle: object; subtitle: string; color: string }[] = [
    { label: 'Great',  mouthStyle: styles.mouthHappy,   subtitle: 'Ambitious goals — you\'ve got this!', color: '#34C759' },
    { label: 'Okay',   mouthStyle: styles.mouthNeutral, subtitle: 'Steady progress, one step at a time.', color: '#8E8E93' },
    { label: 'Rough',  mouthStyle: styles.mouthSad,     subtitle: 'Easy goals today — that\'s enough. 💙', color: '#5E5CE6' },
  ];

  // ---- Daily goals state ----
  type Goal = { text: string; checked: boolean };
  const [goals, setGoals] = useState<Goal[]>([]);
  const [career, setCareer] = useState('your career');
  const [university, setUniversity] = useState('your university');
  const [userName, setUserName] = useState('');
  const storageKey = `goals_checked_${todayKey}`;

  // ---- Streak calendar state ----
  const [streakData, setStreakData] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);

  // ---- Alignment score state ----
  const [alignScore, setAlignScore] = useState<number | null>(null);
  const [scoreDelta, setScoreDelta] = useState(0);
  const [scoreExplanation, setScoreExplanation] = useState('');
  const [scoreHistory, setScoreHistory] = useState<ScorePoint[]>([]);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [showTrend, setShowTrend] = useState(false);
  const [trendPeriod, setTrendPeriod] = useState<7 | 30 | 90>(7);

  // ---- Compute streak (returns value + sets state) ----
  const computeStreak = (data: Record<string, number>, liveGoals: Goal[]): number => {
    const todayCount = liveGoals.filter(g => g.checked).length;
    let s = 0;
    const base = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = i === 0 ? todayCount : (data[key] ?? 0);
      if (count === 5) s++;
      else break;
    }
    setStreak(s);
    return s;
  };

  // ---- Load all goal-check streak data ----
  const loadStreakData = async (liveGoals: Goal[]): Promise<{ data: Record<string, number>; computedStreak: number }> => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const goalKeys = allKeys.filter(k => k.startsWith('goals_checked_'));
      const pairs = await AsyncStorage.multiGet(goalKeys);
      const data: Record<string, number> = {};
      for (const [key, val] of pairs) {
        if (val) {
          const dateKey = key.replace('goals_checked_', '');
          const arr: boolean[] = JSON.parse(val);
          data[dateKey] = arr.filter(Boolean).length;
        }
      }
      setStreakData(data);
      const computedStreak = computeStreak(data, liveGoals);
      return { data, computedStreak };
    } catch (_) {
      return { data: {}, computedStreak: 0 };
    }
  };

  // ---- Fetch alignment score from server ----
  const fetchAlignmentScore = async (data: Record<string, number>, currentStreak: number) => {
    setScoreLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/alignment-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ streakData: data, currentStreak }),
      });
      const json = await res.json();
      if (res.ok) {
        setAlignScore(json.score);
        setScoreDelta(json.delta);
        setScoreExplanation(json.explanation);
        setScoreHistory(json.history ?? []);
        await AsyncStorage.setItem('score_cache', JSON.stringify(json));
      }
    } catch (_) {
      // fall back to local cache (already loaded on mount)
    } finally {
      setScoreLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      // Show cached score instantly while server computes
      const cached = await AsyncStorage.getItem('score_cache');
      if (cached) {
        const c = JSON.parse(cached);
        setAlignScore(c.score);
        setScoreDelta(c.delta ?? 0);
        setScoreExplanation(c.explanation ?? '');
        setScoreHistory(c.history ?? []);
      }

      try {
        const raw = await AsyncStorage.getItem('user');
        const user = raw ? JSON.parse(raw) : {};

        const resolvedCareer =
          typeof user.selectedCareer === 'string'
            ? user.selectedCareer
            : user.selectedCareer?.title ?? 'your career';
        const resolvedUniversity =
          typeof user.selectedUniversity === 'string'
            ? user.selectedUniversity
            : user.selectedUniversity?.name ?? 'your university';

        setCareer(resolvedCareer);
        setUniversity(resolvedUniversity);
        if (user.username) setUserName(user.username.split(' ')[0]);

        // Load saved mood for today
        const savedMood = await AsyncStorage.getItem(moodStorageKey);
        const resolvedMood: MoodLevel = (savedMood !== null ? parseInt(savedMood) : 1) as MoodLevel;
        setMoodIndex(resolvedMood);

        const dailyGoalTexts = getDailyGoals(resolvedCareer, resolvedUniversity, todayKey, resolvedMood);
        const savedRaw = await AsyncStorage.getItem(storageKey);
        const savedChecked: boolean[] = savedRaw ? JSON.parse(savedRaw) : Array(5).fill(false);

        const loadedGoals = dailyGoalTexts.map((text, i) => ({ text, checked: savedChecked[i] ?? false }));
        setGoals(loadedGoals);

        const { data, computedStreak } = await loadStreakData(loadedGoals);
        await fetchAlignmentScore(data, computedStreak);
      } catch (_) {
        const generic = getDailyGoals('your career', 'your university', todayKey, 1);
        const fallback = generic.map(text => ({ text, checked: false }));
        setGoals(fallback);
        const { data, computedStreak } = await loadStreakData(fallback);
        await fetchAlignmentScore(data, computedStreak);
      }
    })();
  }, []);

  const handleMoodChange = async () => {
    const next = ((moodIndex + 1) % 3) as MoodLevel;
    setMoodIndex(next);
    await AsyncStorage.setItem(moodStorageKey, String(next));
    // Regenerate goals for new mood (reset checkboxes — different tasks)
    const newGoalTexts = getDailyGoals(career, university, todayKey, next);
    const newGoals = newGoalTexts.map(text => ({ text, checked: false }));
    setGoals(newGoals);
    await AsyncStorage.setItem(storageKey, JSON.stringify(Array(5).fill(false)));
  };

  const toggleGoal = async (index: number) => {
    const updated = goals.map((g, i) =>
      i === index ? { ...g, checked: !g.checked } : g
    );
    setGoals(updated);
    await AsyncStorage.setItem(storageKey, JSON.stringify(updated.map(g => g.checked)));
    computeStreak(streakData, updated);
  };
  // ---------------------------

  // Live count of goals checked today (drives today's dot)
  const todayChecked = goals.filter(g => g.checked).length;

  // Streak calendar: show last 3 months including current
  const now = new Date();
  const calendarMonths = [2, 1, 0].map(offset => {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome, {userName || 'there'}!</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/chatbot')}>
              <MaterialCommunityIcons name="chat-processing-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/profile')}>
              <Ionicons name="person" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={[styles.card, styles.halfCard]} 
            onPress={handleMoodChange}
          >
            <Text style={styles.cardHeader}>Mood Today</Text>
            <View style={styles.moodFace}>
               <View style={styles.eyesRow}>
                 <View style={styles.eye} /><View style={styles.eye} />
               </View>
               <View style={[styles.mouthBase, moods[moodIndex].mouthStyle]} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.card, styles.halfCard]}
            activeOpacity={0.8}
            onPress={() => setShowTrend(v => !v)}
          >
            {scoreLoading && alignScore === null ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                {scoreDelta !== 0 && (
                  <View style={[styles.deltaBadge, scoreDelta > 0 ? styles.deltaUp : styles.deltaDown]}>
                    <Text style={styles.deltaBadgeText}>
                      {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
                    </Text>
                    <Ionicons
                      name={scoreDelta > 0 ? 'arrow-up' : 'arrow-down'}
                      size={10}
                      color={scoreDelta > 0 ? '#34C759' : '#FF3B30'}
                    />
                  </View>
                )}
                <Text style={styles.scoreText}>{alignScore ?? '—'}</Text>
                <Text style={styles.scoreSub}>Career alignment</Text>
                <Ionicons
                  name={showTrend ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color="#48474D"
                  style={{ marginTop: 4 }}
                />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Score trend expand ── */}
        {showTrend && (
          <View style={styles.card}>
            {/* Period tabs */}
            <View style={styles.trendTabs}>
              {([7, 30, 90] as const).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.trendTab, trendPeriod === p && styles.trendTabActive]}
                  onPress={() => setTrendPeriod(p)}
                >
                  <Text style={[styles.trendTabText, trendPeriod === p && styles.trendTabTextActive]}>
                    {p}d
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sparkline */}
            <Sparkline data={scoreHistory} range={trendPeriod} />

            {/* Score range labels */}
            {scoreHistory.length > 1 && (() => {
              const pts = scoreHistory.slice(-trendPeriod);
              const hi = Math.max(...pts.map(p => p.score));
              const lo = Math.min(...pts.map(p => p.score));
              return (
                <View style={styles.trendRange}>
                  <Text style={styles.trendRangeText}>{lo}</Text>
                  <Text style={styles.trendRangeText}>{hi}</Text>
                </View>
              );
            })()}

            {/* Explanation tooltip */}
            {scoreExplanation ? (
              <View style={styles.explanationBox}>
                <Ionicons name="information-circle" size={15} color="#8E8E93" style={{ marginTop: 1 }} />
                <Text style={styles.explanationText}>{scoreExplanation}</Text>
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.card}>
          {/* Month labels */}
          <View style={styles.calendarHeader}>
            {calendarMonths.map(({ year, month }) => (
              <Text key={`${year}-${month}`} style={styles.monthLabel}>
                {MONTH_NAMES[month]}
              </Text>
            ))}
          </View>

          {/* Dot grids */}
          <View style={styles.gridsRow}>
            {calendarMonths.map(({ year, month }) => {
              const days = daysInMonth(year, month);
              return (
                <View key={`${year}-${month}`} style={styles.monthGrid}>
                  {[...Array(days)].map((_, i) => {
                    const day = i + 1;
                    const key = dateKeyForDay(year, month, day);
                    const isToday = key === todayKey;
                    const count = isToday ? todayChecked : (streakData[key] ?? 0);
                    const isFuture = !isToday && new Date(year, month, day) > now;
                    const bgColor = isFuture ? '#2C2C2E' : dotColor(count);
                    return (
                      <View
                        key={i}
                        style={[
                          styles.dot,
                          { backgroundColor: bgColor },
                          count === 5 && !isFuture && styles.dotGlow,
                          isToday && styles.dotToday,
                        ]}
                      />
                    );
                  })}
                </View>
              );
            })}
          </View>

          {/* Streak row */}
          <View style={styles.theoryRow}>
            <View style={styles.progressRing}>
              <Text style={styles.progressNum}>{streak}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.theoryTitle}>{streak === 1 ? '1 day streak' : `${streak} day streak`}</Text>
              <Text style={styles.theorySub}>
                {todayChecked === 5
                  ? 'All goals done today — keep it up!'
                  : `${todayChecked}/5 goals completed today`}
              </Text>
            </View>
            <Ionicons name="flame" size={18} color={streak > 0 ? '#FF6B35' : '#444'} />
          </View>
        </View>

        <TouchableOpacity 
           style={styles.card} 
           onPress={() => router.push('/planner')}
        >
          <Text style={styles.sectionTitle}>Goals for today</Text>
          <Text style={[styles.moodGoalSubtitle, { color: moods[moodIndex].color }]}>
            {moods[moodIndex].subtitle}
          </Text>
          {goals.length === 0 ? (
            <Text style={styles.scoreSub}>Loading your goals…</Text>
          ) : (
            goals.map((goal, index) => (
              <TouchableOpacity
                key={index}
                style={styles.goalRow}
                onPress={(e) => { e.stopPropagation(); toggleGoal(index); }}
                activeOpacity={0.7}
              >
                <View style={[styles.goalCheckbox, goal.checked && styles.goalCheckboxChecked]}>
                  {goal.checked && <Ionicons name="checkmark" size={13} color="black" />}
                </View>
                <Text style={[styles.goalText, goal.checked && styles.goalTextDone]}>
                  {goal.text}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.push('/dashboard')}>
            <MaterialCommunityIcons name="view-grid" size={26} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/planner')}>
            <Ionicons name="calendar-outline" size={24} color="#444" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/analytics')}>
            <Ionicons name="stats-chart" size={24} color="#444" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/chatbot')}>
            <MaterialCommunityIcons name="comment-text-outline" size={24} color="#444" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  welcomeText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  headerButtons: { flexDirection: 'row', gap: 10 },
  iconButton: { backgroundColor: '#1C1C1E', padding: 10, borderRadius: 25, borderWidth: 1, borderColor: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  card: { backgroundColor: '#161618', borderRadius: 28, padding: 20, marginBottom: 15 },
  halfCard: { width: '48%', height: 160, justifyContent: 'space-between', alignItems: 'center' },
  cardHeader: { color: 'white', fontSize: 14 },
  scoreText: { color: 'white', fontSize: 52, fontWeight: 'bold' },
  scoreSub: { color: '#8E8E93', fontSize: 11, textAlign: 'center' },
  deltaBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  deltaUp: { backgroundColor: 'rgba(52,199,89,0.15)' },
  deltaDown: { backgroundColor: 'rgba(255,59,48,0.15)' },
  deltaBadgeText: { fontSize: 11, fontWeight: '600', color: 'white' },
  trendTabs: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  trendTab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#2C2C2E' },
  trendTabActive: { backgroundColor: '#FFFFFF' },
  trendTabText: { color: '#8E8E93', fontSize: 13, fontWeight: '600' },
  trendTabTextActive: { color: '#000000' },
  trendRange: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -8, marginBottom: 4 },
  trendRangeText: { color: '#48474D', fontSize: 11 },
  explanationBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#1C1C1E', borderRadius: 14, padding: 12, marginTop: 4 },
  explanationText: { color: '#8E8E93', fontSize: 13, flex: 1, lineHeight: 19 },
  moodFace: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
  eyesRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  eye: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'black' },
  mouthBase: { width: 24, height: 12, borderBottomWidth: 3, borderColor: 'black' },
  mouthHappy: { borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  mouthNeutral: { height: 0, marginTop: 5 },
  mouthSad: { borderTopWidth: 3, borderBottomWidth: 0, borderTopLeftRadius: 12, borderTopRightRadius: 12, marginTop: 10 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  monthLabel: { color: '#8E8E93', fontSize: 14 },
  gridsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', width: '30%', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#48474D' },
  dotGlow: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 5,
    elevation: 6,
  },
  dotToday: {
    borderWidth: 1,
    borderColor: '#AAAACC',
  },
  theoryRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#242426', paddingTop: 15 },
  progressRing: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#444', justifyContent: 'center', alignItems: 'center' },
  progressNum: { color: 'white', fontSize: 16 },
  theoryTitle: { color: 'white', fontSize: 15 },
  theorySub: { color: '#444', fontSize: 12 },
  sectionTitle: { color: 'white', fontSize: 18, marginBottom: 4 },
  moodGoalSubtitle: { fontSize: 12, marginBottom: 14, fontStyle: 'italic' },
  goalRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  goalCheckbox: { width: 22, height: 22, borderRadius: 6, backgroundColor: '#2C2C2E', marginRight: 12, marginTop: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#3A3A3C', flexShrink: 0 },
  goalCheckboxChecked: { backgroundColor: '#FFFFFF' },
  goalText: { color: '#E0E0E0', fontSize: 14, flex: 1, lineHeight: 20 },
  goalTextDone: { color: '#555', textDecorationLine: 'line-through' },
  navBar: { position: 'absolute', bottom: 0, width: width, height: 90, backgroundColor: '#000', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1C1C1E', paddingBottom: 20 }
});