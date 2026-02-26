import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Chatbot() {
  const router = useRouter();
  const [message, setMessage] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="menu" size={32} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Check in</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false}>
        <View style={styles.aiBubble}>
          <Text style={styles.aiText}>
            I do not experience time, events, or feelings the way humans do, so I do not actually have a day. Nothing happens to me between messages, and I do not wake up, get tired, or have personal moments.
          </Text>
        </View>
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} value={message} onChangeText={setMessage} placeholderTextColor="#444" />
            <TouchableOpacity style={styles.sendBtn}><Ionicons name="send" size={20} color="black" /></TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.push('/dashboard')}><MaterialCommunityIcons name="view-grid" size={26} color="#444" /></TouchableOpacity>
        <TouchableOpacity><Ionicons name="calendar-outline" size={24} color="#444" /></TouchableOpacity>
        <TouchableOpacity><Ionicons name="stats-chart" size={24} color="#444" /></TouchableOpacity>
        <TouchableOpacity><MaterialCommunityIcons name="comment-text" size={24} color="white" /></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0B' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { color: 'white', fontSize: 32, fontWeight: '500' },
  chatContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 150 },
  aiBubble: { backgroundColor: '#1C1C1E', padding: 16, borderRadius: 20, maxWidth: '85%', alignSelf: 'flex-end' },
  aiText: { color: '#D1D1D6', fontSize: 14, lineHeight: 20 },
  inputArea: { paddingHorizontal: 20, position: 'absolute', bottom: 110, width: width },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderRadius: 30, paddingHorizontal: 15, height: 55 },
  input: { flex: 1, color: 'white', fontSize: 16 },
  sendBtn: { backgroundColor: '#E5E5EA', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  navBar: { position: 'absolute', bottom: 0, width: width, height: 90, backgroundColor: '#000', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1C1C1E', paddingBottom: 20 }
});