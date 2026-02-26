import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CareerAssessment() {
  const router = useRouter();

  // The 4 questions from your design
  const questions = [
    { id: 1, text: "Do you worry about things?" },
    { id: 2, text: "Fear for the worst." },
    { id: 3, text: "Am afraid of many things." },
    { id: 4, text: "Get stressed out easily." }
  ];

  // State to track answers for each question ID
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleSelect = (questionId: number, index: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: index }));
  };

  // Only allow finishing if all 4 are answered
  const isComplete = Object.keys(answers).length === questions.length;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Career assessment</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {questions.map((q) => (
          <View key={q.id} style={styles.questionCard}>
            <Text style={styles.questionText}>{q.text}</Text>
            
            <View style={styles.iconRow}>
              {[0, 1, 2, 3, 4].map((i) => (
                <TouchableOpacity 
                  key={i} 
                  activeOpacity={0.7}
                  style={[
                    styles.moodCircle, 
                    answers[q.id] === i && styles.moodCircleActive
                  ]}
                  onPress={() => handleSelect(q.id, i)}
                >
                  {/* Custom mouth lines to simulate the icons in the design */}
                  <View style={[
                    styles.mouthBase, 
                    i === 0 && styles.mouthHappy,
                    i === 1 && styles.mouthSmile,
                    i === 2 && styles.mouthNeutral,
                    i === 3 && styles.mouthFrown,
                    i === 4 && styles.mouthSad,
                    answers[q.id] === i && styles.mouthActive
                  ]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* This button now redirects to the Results page */}
        <TouchableOpacity 
          style={[styles.finishBtn, !isComplete && styles.finishBtnDisabled]}
          onPress={() => router.replace('/results')}
          disabled={!isComplete}
        >
          <Text style={styles.finishBtnText}>Finish Assessment</Text>
          <Ionicons name="chevron-forward" size={20} color="black" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0B' },
  header: { paddingHorizontal: 25, paddingTop: 20, marginBottom: 10 },
  title: { color: 'white', fontSize: 32, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  questionCard: { 
    backgroundColor: '#161618', 
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 15 
  },
  questionText: { color: 'white', fontSize: 17, marginBottom: 25, fontWeight: '400' },
  iconRow: { flexDirection: 'row', justifyContent: 'space-between' },
  
  // Icon Styles
  moodCircle: { 
    width: 46, 
    height: 46, 
    borderRadius: 23, 
    backgroundColor: '#2C2C2E', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  moodCircleActive: { backgroundColor: 'white' },
  
  // Mouth Shape Logic
  mouthBase: { 
    width: 20, 
    borderBottomWidth: 2, 
    borderColor: '#8E8E93' 
  },
  mouthActive: { borderColor: 'black' },
  mouthHappy: { height: 10, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
  mouthSmile: { height: 6, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
  mouthNeutral: { height: 0, marginBottom: 4 },
  mouthFrown: { 
    height: 6, 
    borderBottomWidth: 0, 
    borderTopWidth: 2, 
    borderTopLeftRadius: 10, 
    borderTopRightRadius: 10,
    marginTop: 8 
  },
  mouthSad: { 
    height: 10, 
    borderBottomWidth: 0, 
    borderTopWidth: 2, 
    borderTopLeftRadius: 10, 
    borderTopRightRadius: 10,
    marginTop: 12 
  },

  // Navigation Button
  finishBtn: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    paddingVertical: 18, 
    borderRadius: 30, 
    marginTop: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 10 
  },
  finishBtnDisabled: { opacity: 0.3 },
  finishBtnText: { color: 'black', fontSize: 16, fontWeight: '700' }
});