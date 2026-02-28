import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Dimensions, Animated,
  ActivityIndicator, TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../../constants/api';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;
const STORAGE_KEY = 'chat_sessions';

// ─── Types ───────────────────────────────────────────────────────────────────
type Message = { role: 'user' | 'ai'; text: string };
type Session = { id: string; title: string; createdAt: string; messages: Message[] };

// ─── Helpers ─────────────────────────────────────────────────────────────────
function newSessionId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeTitle(firstUserMessage: string): string {
  const trimmed = firstUserMessage.trim();
  return trimmed.length > 40 ? trimmed.slice(0, 40).trimEnd() + '…' : trimmed;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function Chatbot() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  // ── Derive active session ──
  const activeSession = sessions.find(s => s.id === activeId) ?? null;

  // ── Load sessions from storage on mount ──
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const loaded: Session[] = JSON.parse(raw);
        setSessions(loaded);
        if (loaded.length > 0) setActiveId(loaded[0].id);
        else startNewSession(loaded);
      } else {
        startNewSession([]);
      }
    })();
  }, []);

  // ── Persist sessions whenever they change ──
  useEffect(() => {
    if (sessions.length > 0) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  // ── Scroll to bottom when messages update ──
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [activeSession?.messages.length, loading]);

  // ── Sidebar animation ──
  const openSidebar = () => {
    setSidebarOpen(true);
    Animated.spring(sidebarAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
      speed: 20,
    }).start();
  };

  const closeSidebar = () => {
    Animated.spring(sidebarAnim, {
      toValue: -SIDEBAR_WIDTH,
      useNativeDriver: true,
      bounciness: 0,
      speed: 20,
    }).start(() => setSidebarOpen(false));
  };

  // ── Session management ──
  const startNewSession = (existing: Session[]) => {
    const fresh: Session = {
      id: newSessionId(),
      title: 'New conversation',
      createdAt: new Date().toISOString(),
      messages: [],
    };
    const updated = [fresh, ...existing];
    setSessions(updated);
    setActiveId(fresh.id);
  };

  const switchSession = (id: string) => {
    setActiveId(id);
    closeSidebar();
  };

  // ── Send message ──
  const send = async () => {
    const text = message.trim();
    if (!text || loading) return;
    setMessage('');

    const userMsg: Message = { role: 'user', text };

    // Append user message to active session
    setSessions(prev => prev.map(s => {
      if (s.id !== activeId) return s;
      const newMessages = [...s.messages, userMsg];
      // Set title from first user message
      const title = s.messages.length === 0 ? makeTitle(text) : s.title;
      return { ...s, title, messages: newMessages };
    }));

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');

      // Build history in OpenAI format for the backend
      const currentSession = sessions.find(s => s.id === activeId);
      const history = [
        ...(currentSession?.messages ?? []).map(m => ({
          role: m.role === 'ai' ? 'assistant' : 'user',
          content: m.text,
        })),
        { role: 'user', content: text },
      ];

      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: history }),
      });

      const json = await res.json();
      const aiMsg: Message = {
        role: 'ai',
        text: res.ok ? json.reply : (json.error ?? 'Something went wrong.'),
      };

      setSessions(prev => prev.map(s =>
        s.id === activeId ? { ...s, messages: [...s.messages, aiMsg] } : s
      ));
    } catch {
      setSessions(prev => prev.map(s =>
        s.id === activeId
          ? { ...s, messages: [...s.messages, { role: 'ai', text: 'Could not reach the server.' }] }
          : s
      ));
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openSidebar}>
          <Ionicons name="menu" size={32} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {activeSession?.title ?? 'Check in'}
        </Text>
        <TouchableOpacity onPress={() => startNewSession(sessions)}>
          <Ionicons name="create-outline" size={26} color="white" />
        </TouchableOpacity>
      </View>

      {/* ── Messages ── */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {activeSession && activeSession.messages.length === 0 && (
          <View style={styles.emptyHint}>
            <Text style={styles.emptyHintText}>Ask me anything about your career path, goals, or daily check-in.</Text>
          </View>
        )}
        {activeSession?.messages.map((msg, i) =>
          msg.role === 'user' ? (
            <View key={i} style={styles.userBubble}>
              <Text style={styles.userText}>{msg.text}</Text>
            </View>
          ) : (
            <View key={i} style={styles.aiBubble}>
              <Text style={styles.aiText}>{msg.text}</Text>
            </View>
          )
        )}
        {loading && (
          <View style={styles.aiBubble}>
            <ActivityIndicator size="small" color="#8E8E93" />
          </View>
        )}
      </ScrollView>

      {/* ── Input ── */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Message PathAI…"
              placeholderTextColor="#444"
              multiline
              onSubmitEditing={send}
              returnKeyType="send"
            />
            <TouchableOpacity style={[styles.sendBtn, (!message.trim() || loading) && styles.sendBtnDisabled]} onPress={send} disabled={!message.trim() || loading}>
              <Ionicons name="send" size={18} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ── Nav Bar ── */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.push('/dashboard')}><MaterialCommunityIcons name="view-grid" size={26} color="#444" /></TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/planner')}><Ionicons name="calendar-outline" size={24} color="#444" /></TouchableOpacity>
        <TouchableOpacity><Ionicons name="stats-chart" size={24} color="#444" /></TouchableOpacity>
        <TouchableOpacity><MaterialCommunityIcons name="comment-text" size={24} color="white" /></TouchableOpacity>
      </View>

      {/* ── Sidebar overlay ── */}
      {sidebarOpen && (
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Conversations</Text>
            <TouchableOpacity style={styles.newChatBtn} onPress={() => { startNewSession(sessions); closeSidebar(); }}>
              <Ionicons name="add" size={18} color="black" />
              <Text style={styles.newChatText}>New chat</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {sessions.map(s => (
              <TouchableOpacity
                key={s.id}
                style={[styles.sessionItem, s.id === activeId && styles.sessionItemActive]}
                onPress={() => switchSession(s.id)}
              >
                <View style={styles.sessionIcon}>
                  <MaterialCommunityIcons name="chat-outline" size={16} color={s.id === activeId ? 'black' : '#8E8E93'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sessionTitle, s.id === activeId && styles.sessionTitleActive]} numberOfLines={1}>
                    {s.title}
                  </Text>
                  <Text style={styles.sessionDate}>{formatDate(s.createdAt)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0B' },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '600', flex: 1, textAlign: 'center', marginHorizontal: 10 },

  // Chat
  chatContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 160 },
  emptyHint: { alignItems: 'center', marginTop: 60, paddingHorizontal: 30 },
  emptyHintText: { color: '#48474D', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  userBubble: { backgroundColor: '#2C2C2E', padding: 14, borderRadius: 20, borderBottomRightRadius: 4, maxWidth: '80%', alignSelf: 'flex-end', marginBottom: 10 },
  userText: { color: 'white', fontSize: 15, lineHeight: 21 },
  aiBubble: { backgroundColor: '#1C1C1E', padding: 14, borderRadius: 20, borderBottomLeftRadius: 4, maxWidth: '80%', alignSelf: 'flex-start', marginBottom: 10 },
  aiText: { color: '#D1D1D6', fontSize: 15, lineHeight: 21 },

  // Input
  inputArea: { paddingHorizontal: 20, paddingVertical: 10, position: 'absolute', bottom: 90, width: width },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#1C1C1E', borderRadius: 26, paddingHorizontal: 16, paddingVertical: 8, minHeight: 52 },
  input: { flex: 1, color: 'white', fontSize: 16, maxHeight: 120, paddingTop: 4 },
  sendBtn: { backgroundColor: '#E5E5EA', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendBtnDisabled: { opacity: 0.35 },

  // Nav
  navBar: { position: 'absolute', bottom: 0, width, height: 90, backgroundColor: '#000', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1C1C1E', paddingBottom: 20 },

  // Sidebar
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)' },
  sidebar: { position: 'absolute', top: 0, bottom: 0, left: 0, width: SIDEBAR_WIDTH, backgroundColor: '#111113', borderRightWidth: 1, borderRightColor: '#1C1C1E', zIndex: 100 },
  sidebarHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1C1C1E', gap: 12 },
  sidebarTitle: { color: 'white', fontSize: 22, fontWeight: '700' },
  newChatBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E5E5EA', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start', gap: 6 },
  newChatText: { color: 'black', fontSize: 14, fontWeight: '600' },
  sessionItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1A1A1C', gap: 12 },
  sessionItemActive: { backgroundColor: '#FFFFFF' },
  sessionIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#1C1C1E', justifyContent: 'center', alignItems: 'center' },
  sessionTitle: { color: '#D1D1D6', fontSize: 14, fontWeight: '500' },
  sessionTitleActive: { color: 'black' },
  sessionDate: { color: '#48474D', fontSize: 12, marginTop: 2 },
});