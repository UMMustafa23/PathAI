import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function ResultsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        console.log("No token found");
        setLoading(false);
        return;
      }

      const response = await fetch("http://172.20.10.4:3000/results", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await response.json();

      console.log("Status:", response.status);
      console.log("Data:", json);

      if (response.ok) {
        setData(json);
      }

    } catch (error) {
      console.log("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'white' }}>No Results Found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Results</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>{data.summary}</Text>

          <View style={styles.tagRow}>
            {data.tags?.map((tag: string) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recommended Careers</Text>
        {data.careers?.map((career: any, index: number) => (
          <View key={index} style={styles.careerCard}>
            <Text style={styles.careerTitle}>{career.title}</Text>
            <Text style={styles.matchText}>{career.match} Match</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Universities</Text>
        <View style={styles.uniGrid}>
          {data.universities?.map((uni: any, i: number) => (
            <View key={i} style={styles.uniCard}>
              <Text style={styles.uniName}>{uni.name}</Text>
              <Text style={styles.uniLocation}>{uni.location}</Text>
            </View>
          ))}
        </View>

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
  center: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#0A0A0B' },
  title: { color: 'white', fontSize: 36, fontWeight: 'bold', marginBottom: 30 },
  summaryCard: { backgroundColor: '#1C1C1E', borderRadius: 28, padding: 24, marginBottom: 30 },
  summaryText: { color: '#EBEBF5', fontSize: 15, lineHeight: 22, marginBottom: 20 },
  tagRow: { flexDirection: 'row', flexWrap:'wrap' },
  tag: { backgroundColor: '#E0E0E0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, margin:4 },
  tagText: { color: 'black', fontSize: 12, fontWeight: '600' },
  sectionTitle: { color: 'white', fontSize: 22, fontWeight: '600', marginBottom: 20, marginTop: 10 },
  careerCard: { backgroundColor: '#1C1C1E', borderRadius: 24, height: 85, marginBottom: 15, padding: 24, justifyContent: 'center' },
  careerTitle: { color: 'white', fontSize: 16, fontWeight: '500' },
  matchText: { color: '#8E8E93', fontSize: 12, position: 'absolute', right: 24 },
  uniGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  uniCard: { width: (width - 65) / 2, height: 100, backgroundColor: '#1C1C1E', borderRadius: 24, padding: 16, justifyContent: 'center', marginBottom:15 },
  uniName: { color: 'white', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  uniLocation: { color: '#8E8E93', fontSize: 12 },
  keepGoingBtn: { backgroundColor: 'white', paddingVertical: 18, borderRadius: 25, marginTop: 50, alignItems: 'center' },
  btnText: { color: 'black', fontSize: 18, fontWeight: '700' }
});