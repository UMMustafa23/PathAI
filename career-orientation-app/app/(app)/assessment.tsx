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

  const questions = [
    { id: 1, text: "Do you worry about things?" },
    { id: 2, text: "Fear for the worst." },
    { id: 3, text: "Am afraid of many things." },
    { id: 4, text: "Get stressed out easily." }
  ];

  // Store selections for each question
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleSelect = (questionId: number, index: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: index }));
  };

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
                  style={[
                    styles.moodCircle, 
                    answers[q.id] === i && styles.moodCircleActive
                  ]}
                  onPress={() => handleSelect(q.id, i)}
                >
                  <View style={[
                    styles.mouth, 
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

        <TouchableOpacity 
          style={[styles.finishBtn, !isComplete && styles.finishBtnDisabled]}
          onPress={() => router.replace('/dashboard')}
          disabled={!isComplete}
        >
          <Text style={styles.finishBtnText}>Finish Assessment</Text>
          <Ionicons name="checkmark-circle" size={20} color="black" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0B' },
  header: { paddingHorizontal: 25, paddingTop: 20, marginBottom: 20 },
  title: { color: 'white', fontSize: 32, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  questionCard: { 
    backgroundColor: '#1C1C1E', 
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 15 
  },
  questionText: { color: 'white', fontSize: 18, marginBottom: 25 },
  iconRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5 },
  moodCircle: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#2C2C2E', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  moodCircleActive: { backgroundColor: 'white' },
  mouth: { width: 18, height: 9, borderWidth: 2, borderColor: '#8E8E93', borderTopWidth: 0 },
  mouthActive: { borderColor: 'black' },
  // Mouth Shapes
  mouthHappy: { borderBottomLeftRadius: 10, borderBottomRightRadius: 10, height: 10 },
  mouthSmile: { borderBottomLeftRadius: 10, borderBottomRightRadius: 10, height: 6 },
  mouthNeutral: { height: 0, borderBottomWidth: 2, marginTop: 4 },
  mouthFrown: { borderTopWidth: 2, borderBottomWidth: 0, borderTopLeftRadius: 10, borderTopRightRadius: 10, height: 6, marginTop: 10 },
  mouthSad: { borderTopWidth: 2, borderBottomWidth: 0, borderTopLeftRadius: 10, borderTopRightRadius: 10, height: 10, marginTop: 10 },
  // Button
  finishBtn: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    padding: 18, 
    borderRadius: 30, 
    marginTop: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 10 
  },
  finishBtnDisabled: { opacity: 0.3 },
  finishBtnText: { color: 'black', fontSize: 16, fontWeight: '700' }
});