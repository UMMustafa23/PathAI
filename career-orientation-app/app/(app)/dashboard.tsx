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
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const router = useRouter();

  // 1. State for Checkboxes
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Wake up', t1: '8:00AM', t2: '8:05AM', completed: false },
    { id: 2, title: 'Brush teeth', t1: '8:05AM', t2: '8:10AM', completed: false },
    { id: 3, title: 'Workout', t1: '8:10AM', t2: '8:15AM', completed: false }
  ]);

  // Toggle checkbox function
  const toggleTask = (id: number) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 2. This removes the default Expo header layout */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.welcomeTextBold}>Name!</Text>
          </View>
          
          {/* 3. Navigation to Profile */}
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="person" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Top Row Widgets */}
        <View style={styles.row}>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.cardTitle}>Mood Today</Text>
            <View style={styles.moodCircle}>
               <View style={styles.moodMouth} />
            </View>
          </View>
          
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.scoreNumber}>190</Text>
            <Text style={styles.cardSubtext}>Career alignment score</Text>
          </View>
        </View>

        {/* Calendar Card */}
        <View style={styles.card}>
          <View style={styles.monthHeader}>
            <Text style={styles.monthLabel}>Jan</Text>
            <Text style={styles.monthLabel}>Feb</Text>
            <Text style={styles.monthLabel}>Mar</Text>
          </View>
          <View style={styles.dotGrid}>
             {Array.from({ length: 42 }).map((_, i) => (
               <View key={i} style={[styles.dot, (i === 5 || i === 6 || i === 20) ? styles.dotActive : null]} />
             ))}
          </View>
          <View style={styles.theoryRow}>
            <View style={styles.progressCircle}><Text style={styles.progressText}>2</Text></View>
            <View style={{flex: 1, marginLeft: 12}}>
              <Text style={styles.theoryTitle}>Theory day: watch the video</Text>
              <Text style={styles.theorySub}>Mondays</Text>
            </View>
            <Feather name="sliders" size={20} color="#666" />
          </View>
        </View>

        <View style={styles.taskContainer}>
          <Text style={styles.sectionTitle}>Tasks for today:</Text>
          
          {tasks.map((task) => (
            <TouchableOpacity 
              key={task.id} 
              style={styles.taskItem}
              onPress={() => toggleTask(task.id)}
              activeOpacity={0.8}
            >
               <View style={[
                 styles.checkbox, 
                 task.completed && styles.checkboxChecked
               ]}>
                 {task.completed && <Ionicons name="checkmark" size={16} color="black" />}
               </View>
               <View style={{flex: 1}}>
                  <Text style={[styles.taskName, task.completed && styles.taskTextDone]}>
                    {task.title}
                  </Text>
               </View>
               <View style={styles.timeContainer}>
                  <Text style={styles.taskTime}>{task.t1}</Text>
                  <Text style={styles.taskTime}>{task.t2}</Text>
               </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.navBar}>
        <MaterialCommunityIcons name="view-grid" size={26} color="white" />
        <Ionicons name="calendar-outline" size={24} color="#555" />
        <Ionicons name="stats-chart" size={24} color="#555" />
        <MaterialCommunityIcons name="comment-text-outline" size={24} color="#555" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  welcomeText: { color: 'white', fontSize: 28, fontWeight: '300' },
  welcomeTextBold: { color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: -5 },
  profileButton: { backgroundColor: '#1C1C1E', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  card: { backgroundColor: '#161618', borderRadius: 24, padding: 20, marginBottom: 12 },
  halfCard: { width: '48.5%', height: 160, alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { color: 'white', fontSize: 15, fontWeight: '500' },
  scoreNumber: { color: 'white', fontSize: 52, fontWeight: 'bold', marginTop: 10 },
  cardSubtext: { color: '#8E8E93', fontSize: 11, textAlign: 'center' },
  moodCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  moodMouth: { width: 24, height: 12, borderBottomWidth: 3, borderColor: '#000', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  monthHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  monthLabel: { color: '#8E8E93', fontSize: 13 },
  dotGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 7, marginBottom: 20 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#2C2C2E' },
  dotActive: { backgroundColor: 'white' },
  theoryRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 0.5, borderTopColor: '#333', paddingTop: 15 },
  progressCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#444', justifyContent: 'center', alignItems: 'center' },
  progressText: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  theoryTitle: { color: 'white', fontSize: 14, fontWeight: '500' },
  theorySub: { color: '#666', fontSize: 12 },
  taskContainer: { backgroundColor: '#161618', borderRadius: 24, padding: 20 },
  sectionTitle: { color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 15 },
  taskItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#242426', padding: 14, borderRadius: 18, marginBottom: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, backgroundColor: '#3A3A3C', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: 'white' },
  taskName: { color: 'white', fontSize: 15 },
  taskTextDone: { color: '#666', textDecorationLine: 'line-through' },
  timeContainer: { alignItems: 'flex-end' },
  taskTime: { color: '#777', fontSize: 10 },
  navBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 35, paddingTop: 15, backgroundColor: '#000', borderTopWidth: 0.5, borderTopColor: '#222', position: 'absolute', bottom: 0, width: width }
});