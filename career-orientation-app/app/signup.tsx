import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SignUp() {
  const router = useRouter();
  
  // Form State
  const [gender, setGender] = useState('F');
  const [isLogin, setIsLogin] = useState(false); // Toggle between Log In / Sign Up

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Top Toggle Switch */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleButton, isLogin && styles.toggleActive]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, !isLogin && styles.toggleActive]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Name</Text>
                <TextInput style={styles.input} placeholderTextColor="#444" />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Surname</Text>
                <TextInput style={styles.input} placeholderTextColor="#444" />
              </View>
            </View>

            <View style={styles.fullInput}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="email-address" 
                autoCapitalize="none"
                placeholderTextColor="#444" 
              />
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Password</Text>
                <TextInput style={styles.input} secureTextEntry placeholderTextColor="#444" />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput style={styles.input} secureTextEntry placeholderTextColor="#444" />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ width: '20%' }}>
                <Text style={styles.label}>Age</Text>
                <TextInput style={styles.input} keyboardType="numeric" maxLength={3} />
              </View>

              <View style={{ width: '35%', marginLeft: '5%' }}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.genderContainer}>
                  {['F', 'M', 'ND'].map((g) => (
                    <TouchableOpacity 
                      key={g} 
                      style={[styles.genderOption, gender === g && styles.genderActive]}
                      onPress={() => setGender(g)}
                    >
                      <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ width: '35%', marginLeft: '5%' }}>
                <Text style={styles.label}>Country</Text>
                <TouchableOpacity style={styles.dropdown}>
                  <Text style={styles.dropdownText}>Choose</Text>
                  <Ionicons name="chevron-down" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={() => router.replace('/dashboard')}
          >
            <Text style={styles.submitButtonText}>Sign Up</Text>
            <Ionicons name="chevron-forward" size={18} color="black" />
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { paddingHorizontal: 25, paddingTop: 40, alignItems: 'center' },
  
  // Toggle Styles
  toggleContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#1C1C1E', 
    borderRadius: 25, 
    padding: 4, 
    width: 220, 
    marginBottom: 50 
  },
  toggleButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 22 },
  toggleActive: { backgroundColor: '#FFF' },
  toggleText: { color: '#8E8E93', fontSize: 15, fontWeight: '600' },
  toggleTextActive: { color: '#000' },

  // Form Styles
  form: { width: '100%', gap: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '47%' },
  fullInput: { width: '100%' },
  label: { color: '#FFF', fontSize: 14, marginBottom: 8, marginLeft: 4 },
  input: { 
    backgroundColor: '#1C1C1E', 
    color: '#FFF', 
    borderRadius: 15, 
    height: 50, 
    paddingHorizontal: 15,
    fontSize: 16
  },

  // Gender & Dropdown
  genderContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#1C1C1E', 
    borderRadius: 15, 
    height: 50, 
    alignItems: 'center',
    padding: 4
  },
  genderOption: { flex: 1, height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  genderActive: { backgroundColor: '#8E8E93' },
  genderText: { color: '#8E8E93', fontSize: 14 },
  genderTextActive: { color: '#FFF' },

  dropdown: { 
    flexDirection: 'row', 
    backgroundColor: '#1C1C1E', 
    borderRadius: 15, 
    height: 50, 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 12 
  },
  dropdownText: { color: '#444', fontSize: 14 },

  // Submit Button
  submitButton: { 
    flexDirection: 'row',
    backgroundColor: '#FFF', 
    paddingVertical: 15, 
    paddingHorizontal: 40, 
    borderRadius: 30, 
    marginTop: 60,
    alignItems: 'center',
    gap: 10
  },
  submitButtonText: { color: '#000', fontSize: 18, fontWeight: '700' }
});