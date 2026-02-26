import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';

const { width } = Dimensions.get('window');

export default function ResultsScreen() {
  const router = useRouter();

  // Data based on the visual layout
  const careerMatches = [
    { title: 'Marketing Manager', match: '95%' },
    { title: 'UX Researcher', match: '90%' },
    { title: 'Data Analyst', match: '90%' },
  ];

  const universities = [
    { name: 'Stanford University', location: 'USA' },
    { name: 'University of Oxford', location: 'UK' },
    { name: 'MIT', location: 'USA' },
    { name: 'ETH Zurich', location: 'Switzerland' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Results</Text>

        {/* Analysis Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            You are detail-oriented marketing professional (Strength) struggling with delegation (Weakness) can leverage industry networking events (Opportunity) to overcome competition from AI-driven tools (Threat).
          </Text>
          <View style={styles.tagRow}>
            {['leader', 'communicator', 'hard-working'].map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recommended Careers Section */}
        <Text style={styles.sectionTitle}>Recommended Careers</Text>
        {careerMatches.map((career, index) => (
          <View key={index} style={styles.careerCard}>
             <Text style={styles.careerTitle}>{career.title}</Text>
             <Text style={styles.matchText}>{career.match} Match</Text>
          </View>
        ))}

        {/* Universities Section with Text */}
        <Text style={styles.sectionTitle}>Universities</Text>
        <View style={styles.uniGrid}>
          {universities.map((uni, i) => (
            <View key={i} style={styles.uniCard}>
              <Text style={styles.uniName}>{uni.name}</Text>
              <Text style={styles.uniLocation}>{uni.location}</Text>
            </View>
          ))}
        </View>

        {/* Bottom Action Button */}
        <TouchableOpacity 
          style={styles.keepGoingBtn}
          onPress={() => router.replace('/dashboard')}
        >
          <Text style={styles.btnText}>Keep going</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0B' },
  scrollContent: { paddingHorizontal: 25, paddingTop: 40, paddingBottom: 60 },
  title: { color: 'white', fontSize: 36, fontWeight: 'bold', marginBottom: 30 },
  summaryCard: { backgroundColor: '#1C1C1E', borderRadius: 28, padding: 24, marginBottom: 30 },
  summaryText: { color: '#EBEBF5', fontSize: 15, lineHeight: 22, marginBottom: 20 },
  tagRow: { flexDirection: 'row', gap: 8 },
  tag: { backgroundColor: '#E0E0E0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  tagText: { color: 'black', fontSize: 12, fontWeight: '600' },
  sectionTitle: { color: 'white', fontSize: 22, fontWeight: '600', marginBottom: 20, marginTop: 10 },
  careerCard: { 
    backgroundColor: '#1C1C1E', 
    borderRadius: 24, 
    height: 85, 
    marginBottom: 15, 
    padding: 24, 
    justifyContent: 'center' 
  },
  careerTitle: { color: 'white', fontSize: 16, fontWeight: '500' },
  matchText: { color: '#8E8E93', fontSize: 12, position: 'absolute', right: 24 },
  uniGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15 },
  uniCard: { 
    width: (width - 65) / 2, 
    height: 100, 
    backgroundColor: '#1C1C1E', 
    borderRadius: 24,
    padding: 16,
    justifyContent: 'center'
  },
  uniName: { color: 'white', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  uniLocation: { color: '#8E8E93', fontSize: 12 },
  keepGoingBtn: { backgroundColor: 'white', paddingVertical: 18, borderRadius: 25, marginTop: 50, alignItems: 'center' },
  btnText: { color: 'black', fontSize: 18, fontWeight: '700' }
});