import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
  Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform,
  ActivityIndicator, Animated, Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../../constants/api';

const { width } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────
type Task = { id: string; title: string; startTime: string; endTime: string; completed: boolean };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DAY_NAMES  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function stripKey(): string { return 'planner_tasks'; }

// ─── Component ────────────────────────────────────────────────────────────────
export default function DailyPlanner() {
  const router  = useRouter();
  const today   = new Date();

  // ── Date state ──
  const [selectedKey, setSelectedKey] = useState(toDateKey(today));
  const [calExpanded, setCalExpanded] = useState(false);
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const calAnim = useRef(new Animated.Value(0)).current;

  // ── Task state ──
  const [allTasks, setAllTasks] = useState<Record<string, Task[]>>({});

  // ── Add-task modal ──
  const [showAdd,    setShowAdd]    = useState(false);
  const [newTitle,   setNewTitle]   = useState('');
  const [newStart,   setNewStart]   = useState('');
  const [newEnd,     setNewEnd]     = useState('');

  // ── AI organiser ──
  const [aiLoading,  setAiLoading]  = useState(false);
  const [aiResult,   setAiResult]   = useState('');
  const [showAiModal,setShowAiModal]= useState(false);

  // ── Load tasks from AsyncStorage on mount ──
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(stripKey());
      if (raw) setAllTasks(JSON.parse(raw));
    })();
  }, []);

  const saveTasks = async (updated: Record<string, Task[]>) => {
    setAllTasks(updated);
    await AsyncStorage.setItem(stripKey(), JSON.stringify(updated));
  };

  const dayTasks: Task[] = allTasks[selectedKey] ?? [];

  // ── Toggle ──
  const toggleTask = async (id: string) => {
    const updated = { ...allTasks, [selectedKey]: dayTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t) };
    await saveTasks(updated);
  };

  // ── Delete ──
  const deleteTask = async (id: string) => {
    const updated = { ...allTasks, [selectedKey]: dayTasks.filter(t => t.id !== id) };
    await saveTasks(updated);
  };

  // ── Add task ──
  const addTask = async () => {
    if (!newTitle.trim()) return;
    const task: Task = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      title: newTitle.trim(),
      startTime: newStart.trim() || '',
      endTime:   newEnd.trim()   || '',
      completed: false,
    };
    const updated = { ...allTasks, [selectedKey]: [...dayTasks, task] };
    await saveTasks(updated);
    setNewTitle(''); setNewStart(''); setNewEnd('');
    setShowAdd(false);
  };

  // ── AI organisation help ──
  const askAI = async () => {
    if (dayTasks.length === 0) {
      Alert.alert('No tasks', 'Add some tasks first so AI can help organise them.');
      return;
    }
    setAiLoading(true);
    setShowAiModal(true);
    setAiResult('');
    try {
      const token = await AsyncStorage.getItem('token');
      const taskList = dayTasks.map((t, i) =>
        `${i+1}. "${t.title}"${t.startTime ? ` at ${t.startTime}${t.endTime ? `–${t.endTime}` : ''}` : ''} (${t.completed ? 'done' : 'pending'})`
      ).join('\n');

      const prompt = `Here are my tasks for ${selectedKey}:\n${taskList}\n\nPlease suggest the best order and timing for these tasks to maximise my productivity. Give a concrete time-blocked schedule and briefly explain why this order works well. Keep it concise and practical.`;

      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
      });
      const json = await res.json();
      setAiResult(res.ok ? json.reply : (json.error ?? 'Something went wrong.'));
    } catch {
      setAiResult('Could not reach the server.');
    } finally {
      setAiLoading(false);
    }
  };

  // ── Calendar expand toggle ──
  const toggleCalendar = () => {
    const toValue = calExpanded ? 0 : 1;
    setCalExpanded(!calExpanded);
    Animated.spring(calAnim, { toValue, useNativeDriver: false, bounciness: 0, speed: 14 }).start();
  };

  const calHeight = calAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 280] });

  // ── Build strip week (7 days centred on selected date) ──
  const selDate = new Date(selectedKey + 'T12:00:00');
  const stripDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(selDate);
    d.setDate(selDate.getDate() - selDate.getDay() + i); // week containing selected
    return d;
  });

  // ── Build full month grid ──
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startOffset  = firstOfMonth.getDay(); // 0=Sun
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const gridCells    = startOffset + daysInMonth;

  // ── Selected date header text ──
  const isTodaySel = toDateKey(today) === selectedKey;
  const headerLabel = isTodaySel ? 'Today' : `${DAY_NAMES[selDate.getDay()]}, ${MONTH_NAMES[selDate.getMonth()]} ${selDate.getDate()}`;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{headerLabel}</Text>
        <TouchableOpacity onPress={toggleCalendar} style={styles.expandBtn}>
          <Ionicons name={calExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      {/* ── Week strip ── */}
      <View style={styles.calendarStrip}>
        {stripDays.map((d, i) => {
          const key    = toDateKey(d);
          const active = key === selectedKey;
          const isToday= key === toDateKey(today);
          return (
            <TouchableOpacity key={i} style={styles.dateItem} onPress={() => setSelectedKey(key)}>
              <Text style={[styles.dayText, active && styles.activeText]}>{DAY_NAMES[d.getDay()]}</Text>
              <View style={[styles.dateDot, active && styles.dateDotActive, isToday && !active && styles.dateDotToday]}>
                <Text style={[styles.dateText, active && styles.activeDateText]}>{d.getDate()}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Full month (animated) ── */}
      <Animated.View style={[styles.fullCalendar, { height: calHeight, overflow: 'hidden' }]}>
        {/* Month navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => { const d = new Date(viewYear, viewMonth-1,1); setViewMonth(d.getMonth()); setViewYear(d.getFullYear()); }}>
            <Ionicons name="chevron-back" size={22} color="white" />
          </TouchableOpacity>
          <Text style={styles.monthNavTitle}>{MONTH_NAMES[viewMonth]} {viewYear}</Text>
          <TouchableOpacity onPress={() => { const d = new Date(viewYear, viewMonth+1,1); setViewMonth(d.getMonth()); setViewYear(d.getFullYear()); }}>
            <Ionicons name="chevron-forward" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* Day-of-week headers */}
        <View style={styles.dowRow}>
          {['S','M','T','W','T','F','S'].map((d,i) => (
            <Text key={i} style={styles.dowText}>{d}</Text>
          ))}
        </View>

        {/* Day grid */}
        <View style={styles.monthGrid}>
          {Array.from({ length: gridCells }, (_, i) => {
            const day = i - startOffset + 1;
            if (day < 1 || day > daysInMonth) return <View key={i} style={styles.gridCell} />;
            const d   = new Date(viewYear, viewMonth, day);
            const key = toDateKey(d);
            const active  = key === selectedKey;
            const isTodayCell = key === toDateKey(today);
            const hasTasks = (allTasks[key]?.length ?? 0) > 0;
            return (
              <TouchableOpacity key={i} style={styles.gridCell} onPress={() => { setSelectedKey(key); toggleCalendar(); }}>
                <View style={[styles.gridDot, active && styles.gridDotActive, isTodayCell && !active && styles.gridDotToday]}>
                  <Text style={[styles.gridDay, active && styles.gridDayActive, isTodayCell && !active && styles.gridDayToday]}>
                    {day}
                  </Text>
                </View>
                {hasTasks && <View style={styles.taskIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      {/* ── Task list ── */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {dayTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tasks for this day.</Text>
            <Text style={styles.emptySubText}>Tap + to add one.</Text>
          </View>
        ) : (
          dayTasks.map(task => (
            <View key={task.id} style={styles.taskCard}>
              <TouchableOpacity onPress={() => toggleTask(task.id)}
                style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
                {task.completed && <Ionicons name="checkmark" size={14} color="black" />}
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={[styles.taskTitle, task.completed && styles.taskDone]}>{task.title}</Text>
                {(task.startTime || task.endTime) ? (
                  <Text style={styles.timeText}>
                    {task.startTime}{task.endTime ? ` – ${task.endTime}` : ''}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity onPress={() => deleteTask(task.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={17} color="#48474D" />
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Add task button */}
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={24} color="#8E8E93" />
          <Text style={styles.addButtonText}>Add task</Text>
        </TouchableOpacity>

        {/* AI help button */}
        <TouchableOpacity style={styles.aiButton} onPress={askAI}>
          <MaterialCommunityIcons name="brain" size={20} color="black" />
          <Text style={styles.aiButtonText}>Help with organisation</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Bottom Nav ── */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.push('/dashboard')}>
          <MaterialCommunityIcons name="view-grid-outline" size={26} color="#444" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/planner')}>
          <Ionicons name="calendar" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/analytics')}>
          <Ionicons name="stats-chart-outline" size={24} color="#444" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/chatbot')}>
          <MaterialCommunityIcons name="comment-text-outline" size={24} color="#444" />
        </TouchableOpacity>
      </View>

      {/* ── Add Task Modal ── */}
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowAdd(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Task</Text>
            <Text style={styles.modalLabel}>Task title</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Study algorithms"
              placeholderTextColor="#48474D"
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />
            <View style={styles.timeRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalLabel}>Start time</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 9:00 AM"
                  placeholderTextColor="#48474D"
                  value={newStart}
                  onChangeText={setNewStart}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.modalLabel}>End time</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 10:00 AM"
                  placeholderTextColor="#48474D"
                  value={newEnd}
                  onChangeText={setNewEnd}
                />
              </View>
            </View>
            <TouchableOpacity
              style={[styles.modalAddBtn, !newTitle.trim() && { opacity: 0.4 }]}
              onPress={addTask}
              disabled={!newTitle.trim()}
            >
              <Text style={styles.modalAddBtnText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── AI Result Modal ── */}
      <Modal visible={showAiModal} transparent animationType="slide" onRequestClose={() => setShowAiModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowAiModal(false)} />
          <View style={[styles.modalSheet, { maxHeight: '75%' }]}>
            <View style={styles.modalHandle} />
            <View style={styles.aiModalHeader}>
              <MaterialCommunityIcons name="brain" size={20} color="white" />
              <Text style={styles.modalTitle}>AI Organisation</Text>
            </View>
            <Text style={styles.aiModalDate}>{headerLabel}</Text>
            {aiLoading ? (
              <View style={styles.aiLoadingBox}>
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.aiLoadingText}>Analysing your schedule…</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
                <Text style={styles.aiResultText}>{aiResult}</Text>
                <View style={{ height: 30 }} />
              </ScrollView>
            )}
            {!aiLoading && (
              <TouchableOpacity style={styles.modalAddBtn} onPress={() => setShowAiModal(false)}>
                <Text style={styles.modalAddBtnText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CELL = Math.floor(width / 7);

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#0A0A0B' },

  // Header
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 18, paddingBottom: 10, paddingHorizontal: 20 },
  headerTitle:    { color: 'white', fontSize: 22, fontWeight: '600' },
  expandBtn:      { position: 'absolute', right: 20 },

  // Week strip
  calendarStrip:  { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#1C1C1E' },
  dateItem:       { alignItems: 'center', width: CELL },
  dayText:        { color: '#444', fontSize: 12, marginBottom: 4 },
  activeText:     { color: 'white' },
  dateDot:        { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  dateDotActive:  { backgroundColor: '#FFFFFF' },
  dateDotToday:   { borderWidth: 1, borderColor: '#5E5CE6' },
  dateText:       { color: '#8E8E93', fontSize: 15, fontWeight: '600' },
  activeDateText: { color: 'black' },

  // Full month calendar
  fullCalendar:   { overflow: 'hidden', backgroundColor: '#111113', borderBottomWidth: 0.5, borderBottomColor: '#1C1C1E' },
  monthNav:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8 },
  monthNavTitle:  { color: 'white', fontSize: 16, fontWeight: '600' },
  dowRow:         { flexDirection: 'row', paddingHorizontal: 4, marginBottom: 4 },
  dowText:        { width: CELL, textAlign: 'center', color: '#48474D', fontSize: 12 },
  monthGrid:      { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 4 },
  gridCell:       { width: CELL, height: 36, alignItems: 'center', justifyContent: 'center' },
  gridDot:        { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  gridDotActive:  { backgroundColor: '#FFFFFF' },
  gridDotToday:   { borderWidth: 1, borderColor: '#5E5CE6' },
  gridDay:        { color: '#8E8E93', fontSize: 13 },
  gridDayActive:  { color: 'black', fontWeight: '600' },
  gridDayToday:   { color: '#5E5CE6', fontWeight: '600' },
  taskIndicator:  { width: 4, height: 4, borderRadius: 2, backgroundColor: '#5E5CE6', marginTop: 1 },

  // Task list
  scrollContent:  { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 130 },
  taskCard:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161618', borderRadius: 18, padding: 16, marginBottom: 10 },
  checkbox:       { width: 24, height: 24, borderRadius: 6, backgroundColor: '#2C2C2E', marginRight: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#3A3A3C', flexShrink: 0 },
  checkboxChecked:{ backgroundColor: '#FFFFFF' },
  taskTitle:      { color: 'white', fontSize: 16, fontWeight: '500' },
  taskDone:       { color: '#444', textDecorationLine: 'line-through' },
  timeText:       { color: '#8E8E93', fontSize: 12, marginTop: 2 },
  deleteBtn:      { padding: 6 },
  emptyState:     { paddingTop: 60, alignItems: 'center' },
  emptyText:      { color: '#48474D', fontSize: 17, fontWeight: '500' },
  emptySubText:   { color: '#333', fontSize: 14, marginTop: 6 },

  // Buttons
  addButton:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 16, borderWidth: 1, borderColor: '#1C1C1E', borderStyle: 'dashed', marginTop: 6, marginBottom: 12 },
  addButtonText:  { color: '#8E8E93', fontSize: 15 },
  aiButton:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 52, borderRadius: 16, backgroundColor: '#FFFFFF', marginTop: 4 },
  aiButtonText:   { color: 'black', fontSize: 15, fontWeight: '600' },

  // Nav
  navBar:         { position: 'absolute', bottom: 0, width, height: 90, backgroundColor: '#000', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1C1C1E', paddingBottom: 20 },

  // Modals
  modalOverlay:   { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop:  { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  modalSheet:     { backgroundColor: '#111113', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  modalHandle:    { width: 36, height: 4, borderRadius: 2, backgroundColor: '#2C2C2E', alignSelf: 'center', marginBottom: 20 },
  modalTitle:     { color: 'white', fontSize: 20, fontWeight: '700', marginBottom: 20 },
  modalLabel:     { color: '#8E8E93', fontSize: 13, marginBottom: 6 },
  modalInput:     { backgroundColor: '#1C1C1E', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, color: 'white', fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2C2C2E' },
  timeRow:        { flexDirection: 'row' },
  modalAddBtn:    { backgroundColor: '#FFFFFF', borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  modalAddBtnText:{ color: 'black', fontSize: 16, fontWeight: '700' },
  aiModalHeader:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
  aiModalDate:    { color: '#48474D', fontSize: 13, marginBottom: 4 },
  aiLoadingBox:   { paddingVertical: 40, alignItems: 'center', gap: 16 },
  aiLoadingText:  { color: '#8E8E93', fontSize: 15 },
  aiResultText:   { color: '#D1D1D6', fontSize: 15, lineHeight: 24 },
});