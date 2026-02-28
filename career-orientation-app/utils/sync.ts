import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../constants/api";

/**
 * Saves all local AsyncStorage activity data to the server.
 * Call this on logout and after major data changes.
 */
export async function saveToServer(): Promise<void> {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    const allKeys = await AsyncStorage.getAllKeys();

    // ── Goals (goals_checked_YYYY-MM-DD) ──
    const goalKeys = allKeys.filter((k) => k.startsWith("goals_checked_"));
    const goalPairs = await AsyncStorage.multiGet(goalKeys);
    const goals: Record<string, boolean[]> = {};
    for (const [k, v] of goalPairs) {
      if (v) goals[k.replace("goals_checked_", "")] = JSON.parse(v);
    }

    // ── Moods (mood_YYYY-MM-DD) ──
    const moodKeys = allKeys.filter((k) => k.startsWith("mood_"));
    const moodPairs = await AsyncStorage.multiGet(moodKeys);
    const moods: Record<string, number> = {};
    for (const [k, v] of moodPairs) {
      if (v !== null) moods[k.replace("mood_", "")] = parseInt(v);
    }

    // ── Planner tasks ──
    const plannerRaw = await AsyncStorage.getItem("planner_tasks");
    const plannerTasks = plannerRaw ? JSON.parse(plannerRaw) : {};

    // ── App settings ──
    const settingsRaw = await AsyncStorage.getItem("app_settings");
    const appSettings = settingsRaw ? JSON.parse(settingsRaw) : {};

    // ── Chat sessions ──
    const chatRaw = await AsyncStorage.getItem("chat_sessions");
    const chatSessions = chatRaw ? JSON.parse(chatRaw) : [];

    // ── Score cache ──
    const scoreRaw = await AsyncStorage.getItem("score_cache");
    const scoreCache = scoreRaw ? JSON.parse(scoreRaw) : null;

    await fetch(`${API_URL}/user/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ goals, moods, plannerTasks, appSettings, chatSessions, scoreCache }),
    });
  } catch {
    // Silent fail — local data is the source of truth if server is unreachable
  }
}

/**
 * Loads all activity data from the server and writes it into AsyncStorage.
 * Call this immediately after login so the user's data is restored.
 */
export async function loadFromServer(): Promise<void> {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    const res = await fetch(`${API_URL}/user/sync`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;

    const data = await res.json();

    // ── Restore goals ──
    if (data.goals && typeof data.goals === "object") {
      for (const [date, arr] of Object.entries(data.goals)) {
        await AsyncStorage.setItem(`goals_checked_${date}`, JSON.stringify(arr));
      }
    }

    // ── Restore moods ──
    if (data.moods && typeof data.moods === "object") {
      for (const [date, val] of Object.entries(data.moods)) {
        await AsyncStorage.setItem(`mood_${date}`, String(val));
      }
    }

    // ── Restore planner tasks ──
    if (data.plannerTasks && Object.keys(data.plannerTasks).length > 0) {
      await AsyncStorage.setItem("planner_tasks", JSON.stringify(data.plannerTasks));
    }

    // ── Restore app settings ──
    if (data.appSettings && Object.keys(data.appSettings).length > 0) {
      await AsyncStorage.setItem("app_settings", JSON.stringify(data.appSettings));
    }

    // ── Restore chat sessions ──
    if (Array.isArray(data.chatSessions) && data.chatSessions.length > 0) {
      await AsyncStorage.setItem("chat_sessions", JSON.stringify(data.chatSessions));
    }

    // ── Restore score cache ──
    if (data.scoreCache) {
      await AsyncStorage.setItem("score_cache", JSON.stringify(data.scoreCache));
    }
  } catch {
    // Silent fail — proceed with whatever is in local storage
  }
}
