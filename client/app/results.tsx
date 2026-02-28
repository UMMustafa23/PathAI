import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import API_URL from '../constants/api';

interface Career {
  title: string;
  match: string;
  averagePay: string;
  description: string;
}

interface University {
  name: string;
  location: string;
  tuition: string;
  major: string;
  acceptanceRate: string;
  match: string;
  local: boolean;
}

interface ResultData {
  summary: string;
  tags: string[];
  careers: Career[];
  universities: University[];
  selectedCareer: Career | null;
  selectedUniversity: University | null;
}

export default function ResultsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ResultData | null>(null);
  const [activeTab, setActiveTab] = useState<'careers' | 'universities'>('careers');
  const [saving, setSaving] = useState<string | null>(null); // holds item title being saved

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) { setLoading(false); return; }

      const res = await fetch(`${API_URL}/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (err) {
      console.log('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (type: 'career' | 'university', item: Career | University) => {
    try {
      setSaving('title' in item ? item.title : item.name);
      const token = await AsyncStorage.getItem('token');

      const res = await fetch(`${API_URL}/save-selection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, item }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save');

      // Update AsyncStorage with latest user data
      await AsyncStorage.setItem('user', JSON.stringify(json.user));

      // Refresh local results state so the selected badge updates
      setData((prev) => prev
        ? {
            ...prev,
            selectedCareer: type === 'career' ? (item as Career) : prev.selectedCareer,
            selectedUniversity: type === 'university' ? (item as University) : prev.selectedUniversity,
          }
        : prev
      );

      Alert.alert('Saved!', `${(item as Career).title ?? (item as University).name} has been added to your profile.`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(null);
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
        <Text style={styles.emptyText}>No results found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Title */}
        <Text style={styles.title}>Your Results</Text>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>{data.summary}</Text>
          <View style={styles.tagRow}>
            {data.tags?.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'careers' && styles.tabActive]}
            onPress={() => setActiveTab('careers')}
          >
            <Text style={[styles.tabText, activeTab === 'careers' && styles.tabTextActive]}>
              Careers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'universities' && styles.tabActive]}
            onPress={() => setActiveTab('universities')}
          >
            <Text style={[styles.tabText, activeTab === 'universities' && styles.tabTextActive]}>
              Universities
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── CAREERS ── */}
        {activeTab === 'careers' && (
          <>
            {data.careers?.map((career, i) => {
              const isSelected = data.selectedCareer?.title === career.title;
              const isSaving = saving === career.title;
              return (
                <View key={i} style={[styles.card, isSelected && styles.cardSelected]}>
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="black" />
                      <Text style={styles.selectedBadgeText}>Your Choice</Text>
                    </View>
                  )}
                  <View style={styles.cardTopRow}>
                    <Text style={styles.cardTitle}>{career.title}</Text>
                    <View style={styles.matchBadge}>
                      <Text style={styles.matchText}>{career.match}</Text>
                    </View>
                  </View>
                  <Text style={styles.payText}>{career.averagePay}</Text>
                  <Text style={styles.descriptionText}>{career.description}</Text>
                  <TouchableOpacity
                    style={[styles.chooseBtn, isSelected && styles.chooseBtnSelected]}
                    onPress={() => !isSelected && handleSelect('career', career)}
                    disabled={isSaving || isSelected}
                  >
                    {isSaving
                      ? <ActivityIndicator size="small" color="black" />
                      : <Text style={styles.chooseBtnText}>{isSelected ? 'Selected' : 'Choose this career'}</Text>
                    }
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        )}

        {/* ── UNIVERSITIES ── */}
        {activeTab === 'universities' && (
          <>
            {data.universities?.map((uni, i) => {
              const isSelected = data.selectedUniversity?.name === uni.name;
              const isSaving = saving === uni.name;
              return (
                <View key={i} style={[styles.card, isSelected && styles.cardSelected]}>
                  <View style={styles.cardTopRow}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.nameRow}>
                        <Text style={styles.cardTitle}>{uni.name}</Text>
                        {uni.local && (
                          <View style={styles.localBadge}>
                            <Text style={styles.localBadgeText}>Local</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.locationText}>{uni.location}</Text>
                    </View>
                    <View style={styles.matchBadge}>
                      <Text style={styles.matchText}>{uni.match}</Text>
                    </View>
                  </View>

                  <View style={styles.uniMetaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="book-outline" size={13} color="#8E8E93" />
                      <Text style={styles.metaText}>{uni.major}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="cash-outline" size={13} color="#8E8E93" />
                      <Text style={styles.metaText}>{uni.tuition}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="people-outline" size={13} color="#8E8E93" />
                      <Text style={styles.metaText}>Acceptance: {uni.acceptanceRate}</Text>
                    </View>
                  </View>

                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="black" />
                      <Text style={styles.selectedBadgeText}>Your Choice</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.chooseBtn, isSelected && styles.chooseBtnSelected]}
                    onPress={() => !isSelected && handleSelect('university', uni)}
                    disabled={isSaving || isSelected}
                  >
                    {isSaving
                      ? <ActivityIndicator size="small" color="black" />
                      : <Text style={styles.chooseBtnText}>{isSelected ? 'Selected' : 'Choose this university'}</Text>
                    }
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        )}

        <TouchableOpacity
          style={styles.dashboardBtn}
          onPress={() => router.replace('/dashboard')}
        >
          <Text style={styles.dashboardBtnText}>Go to Dashboard</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0B' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0B' },
  emptyText: { color: 'white', fontSize: 16 },

  title: { color: 'white', fontSize: 34, fontWeight: '700', marginBottom: 24 },

  // Summary
  summaryCard: {
    backgroundColor: '#161618',
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
  },
  summaryText: { color: '#EBEBF5', fontSize: 15, lineHeight: 23, marginBottom: 16 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagText: { color: 'black', fontSize: 12, fontWeight: '600' },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#161618',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: 'white' },
  tabText: { color: '#555', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: 'black' },

  // Cards
  card: {
    backgroundColor: '#161618',
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardSelected: { borderColor: 'white' },

  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { color: 'white', fontSize: 17, fontWeight: '600', flex: 1, marginRight: 10 },
  matchBadge: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  matchText: { color: 'white', fontSize: 12, fontWeight: '700' },

  // Career
  payText: { color: '#30D158', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  descriptionText: { color: '#8E8E93', fontSize: 13, lineHeight: 19, marginBottom: 16 },

  // University
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 },
  locationText: { color: '#8E8E93', fontSize: 12, marginBottom: 12 },
  localBadge: {
    backgroundColor: '#1C3A2E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  localBadgeText: { color: '#30D158', fontSize: 10, fontWeight: '700' },
  uniMetaRow: { gap: 6, marginBottom: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#8E8E93', fontSize: 12 },

  // Selection
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  selectedBadgeText: { color: 'black', fontSize: 11, fontWeight: '700' },

  chooseBtn: {
    backgroundColor: 'white',
    paddingVertical: 13,
    borderRadius: 20,
    alignItems: 'center',
  },
  chooseBtnSelected: { backgroundColor: '#2C2C2E' },
  chooseBtnText: { color: 'black', fontSize: 14, fontWeight: '700' },

  // Dashboard button
  dashboardBtn: {
    backgroundColor: '#161618',
    paddingVertical: 18,
    borderRadius: 25,
    marginTop: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  dashboardBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
});