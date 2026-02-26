import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

const { width } = Dimensions.get('window');

export default function DailyPlanner() {
  const router = useRouter();
  
  // State for the currently selected date
  const [selectedDate, setSelectedDate] = useState('16');

  const days = [
    { day: 'Mon', date: '12' },
    { day: 'Tue', date: '13' },
    { day: 'Mar', date: '14' },
    { day: 'Wed', date: '15' },
    { day: 'Thu', date: '16' },
    { day: 'Fri', date: '17' },
    { day: 'Sat', date: '18' },
    { day: 'Sun', date: '19' },
  ];

  // Full task list state
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Wake up', t1: '8:00AM', t2: '8:05AM', completed: true, date: '16' },
    { id: 2, title: 'Brush teeth', t1: '8:05AM', t2: '8:10AM', completed: false, date: '16' },
    { id: 3, title: 'Workout', t1: '8:10AM', t2: '8:40AM', completed: false, date: '16' },
    { id: 4, title: 'Shower', t1: '8:40AM', t2: '9:00AM', completed: false, date: '16' },
    { id: 5, title: 'Breakfast', t1: '9:00AM', t2: '9:20AM', completed: false, date: '16' },
    { id: 6, title: 'Clean up', t1: '9:20AM', t2: '10:00AM', completed: false, date: '16' },
    { id: 7, title: 'Theory of algorithms', t1: '10:00AM', t2: '11:00AM', completed: false, date: '16' },
    { id: 8, title: 'Rest', t1: '11:00AM', t2: '11:30AM', completed: false, date: '16' },
  ]);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Filter tasks based on selected date
  const displayedTasks = tasks.filter(t => t.date === selectedDate);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today</Text>
      </View>

      <View style={styles.calendarStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
          {days.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.dateItem} 
              onPress={() => setSelectedDate(item.date)}
            >
              <Text style={[styles.dayText, selectedDate === item.date && styles.activeText]}>{item.day}</Text>
              <Text style={[styles.dateText, selectedDate === item.date && styles.activeText]}>{item.date}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {displayedTasks.length > 0 ? (
          displayedTasks.map((task) => (
            <TouchableOpacity key={task.id} style={styles.taskCard} onPress={() => toggleTask(task.id)}>
              <View style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
                {task.completed && <Ionicons name="checkmark" size={14} color="black" />}
              </View>
              <Text style={[styles.taskTitle, task.completed && styles.taskDone]}>{task.title}</Text>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{task.t1}</Text>
                <Text style={styles.timeText}>{task.t2}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tasks planned for this day.</Text>
          </View>
        )}

        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={30} color="#8E8E93" />
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.push('/dashboard')}>
          <MaterialCommunityIcons name="view-grid-outline" size={26} color="#444" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/planner')}>
          <Ionicons name="calendar" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="stats-chart-outline" size={24} color="#444" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/chatbot')}>
          <MaterialCommunityIcons name="comment-text-outline" size={24} color="#444" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0B' },
  header: { alignItems: 'center', paddingVertical: 20 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: '600' },
  calendarStrip: { paddingBottom: 20, borderBottomWidth: 0.5, borderBottomColor: '#1C1C1E' },
  dateItem: { width: width / 7, alignItems: 'center', justifyContent: 'center' },
  dayText: { color: '#444', fontSize: 13, marginBottom: 5 },
  dateText: { color: '#444', fontSize: 16, fontWeight: '600' },
  activeText: { color: 'white' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 120 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161618', borderRadius: 20, padding: 20, marginBottom: 12 },
  checkbox: { width: 24, height: 24, borderRadius: 6, backgroundColor: '#2C2C2E', marginRight: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#3A3A3C' },
  checkboxChecked: { backgroundColor: '#FFFFFF' },
  taskTitle: { color: 'white', flex: 1, fontSize: 17 },
  taskDone: { color: '#444', textDecorationLine: 'line-through' },
  timeContainer: { alignItems: 'flex-end' },
  timeText: { color: '#8E8E93', fontSize: 12 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#444', fontSize: 16 },
  addButton: { height: 60, borderRadius: 20, borderWidth: 1, borderColor: '#1C1C1E', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  navBar: { position: 'absolute', bottom: 0, width: width, height: 90, backgroundColor: '#000', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1C1C1E', paddingBottom: 20 }
});