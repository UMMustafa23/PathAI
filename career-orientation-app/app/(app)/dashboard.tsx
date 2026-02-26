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

  const [moodIndex, setMoodIndex] = useState(0);
  const moods = [
    { label: 'Great', mouthStyle: styles.mouthHappy },
    { label: 'Okay', mouthStyle: styles.mouthNeutral },
    { label: 'Rough', mouthStyle: styles.mouthSad },
  ];

  const MonthGrid = ({ activeDots }: { activeDots: number[] }) => (
    <View style={styles.monthGrid}>
      {[...Array(20)].map((_, i) => (
        <View key={i} style={[styles.dot, activeDots.includes(i) && styles.dotActive]} />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome, Name!</Text>
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
            onPress={() => setMoodIndex((moodIndex + 1) % moods.length)}
          >
            <Text style={styles.cardHeader}>Mood Today</Text>
            <View style={styles.moodFace}>
               <View style={styles.eyesRow}>
                 <View style={styles.eye} /><View style={styles.eye} />
               </View>
               <View style={[styles.mouthBase, moods[moodIndex].mouthStyle]} />
            </View>
          </TouchableOpacity>
          
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.scoreText}>190</Text>
            <Text style={styles.scoreSub}>Career alignment score</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.calendarHeader}>
            <Text style={styles.monthLabel}>Jan</Text>
            <Text style={styles.monthLabel}>Feb</Text>
            <Text style={styles.monthLabel}>Mar</Text>
          </View>
          <View style={styles.gridsRow}>
            <MonthGrid activeDots={[5, 6, 10]} />
            <MonthGrid activeDots={[1, 2, 3, 4, 7, 8]} />
            <MonthGrid activeDots={[19]} />
          </View>
          <View style={styles.theoryRow}>
            <View style={styles.progressRing}><Text style={styles.progressNum}>2</Text></View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.theoryTitle}>Theory day: watch the video</Text>
              <Text style={styles.theorySub}>Mondays</Text>
            </View>
            <Feather name="sliders" size={18} color="#444" />
          </View>
        </View>

        <TouchableOpacity 
           style={styles.card} 
           onPress={() => router.push('/planner')}
        >
          <Text style={styles.sectionTitle}>Daily Planner</Text>
          <Text style={styles.scoreSub}>Tap to view your schedule</Text>
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
        <TouchableOpacity>
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
  dot: { width: 6, height: 6, borderRadius: 2, backgroundColor: '#2C2C2E' },
  dotActive: { backgroundColor: 'white' },
  theoryRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#242426', paddingTop: 15 },
  progressRing: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#444', justifyContent: 'center', alignItems: 'center' },
  progressNum: { color: 'white', fontSize: 16 },
  theoryTitle: { color: 'white', fontSize: 15 },
  theorySub: { color: '#444', fontSize: 12 },
  sectionTitle: { color: 'white', fontSize: 18, marginBottom: 15 },
  navBar: { position: 'absolute', bottom: 0, width: width, height: 90, backgroundColor: '#000', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1C1C1E', paddingBottom: 20 }
});