import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Animated, 
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function AuthScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isLogin ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [isLogin]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 106], 
  });

  // Navigation Function
  const handleAuth = () => {
    // replace() is better than push() for login so the user can't go "back" to login
    router.replace('/dashboard'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Animated Toggle Switch */}
          <View style={styles.toggleWrapper}>
            <View style={styles.toggleBackground}>
              <Animated.View style={[styles.slidingBg, { transform: [{ translateX }] }]} />
              <TouchableOpacity style={styles.toggleBtn} onPress={() => setIsLogin(true)}>
                <Text style={[styles.toggleText, isLogin && styles.activeTabText]}>Log In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toggleBtn} onPress={() => setIsLogin(false)}>
                <Text style={[styles.toggleText, !isLogin && styles.activeTabText]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {!isLogin && (
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
            )}

            <View style={styles.fullInput}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput style={styles.input} keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View style={styles.fullInput}>
              <Text style={styles.label}>Password</Text>
              <TextInput style={styles.input} secureTextEntry />
            </View>

            {!isLogin && (
              <>
                <View style={styles.fullInput}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput style={styles.input} secureTextEntry />
                </View>

                <View style={styles.row}>
                  <View style={{ width: '22%' }}>
                    <Text style={styles.label}>Age</Text>
                    <TextInput style={styles.input} keyboardType="numeric" />
                  </View>
                  <View style={{ width: '33%' }}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.genderBox}>
                      <Text style={styles.genderTextActive}>F</Text>
                      <Text style={styles.genderText}>M</Text>
                      <Text style={styles.genderText}>ND</Text>
                    </View>
                  </View>
                  <View style={{ width: '38%' }}>
                    <Text style={styles.label}>Country</Text>
                    <View style={styles.dropdown}>
                      <Text style={styles.dropdownLabel}>Choose</Text>
                      <Ionicons name="chevron-down" size={14} color="white" />
                    </View>
                  </View>
                </View>
              </>
            )}

            {isLogin && (
              <TouchableOpacity onPress={() => setIsLogin(false)}>
                <Text style={styles.switchLink}>Do not have an account? Go to Sign Up</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Main Action Button - Now connects to Dashboard */}
          <TouchableOpacity 
            style={styles.mainBtn}
            onPress={handleAuth}
          >
            <Text style={styles.mainBtnText}>{isLogin ? 'Log In' : 'Sign Up'}</Text>
            <Ionicons name="chevron-forward" size={20} color="black" />
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { paddingHorizontal: 30, paddingTop: 60, alignItems: 'center', paddingBottom: 40 },
  toggleWrapper: { marginBottom: 50 },
  toggleBackground: { flexDirection: 'row', backgroundColor: '#1C1C1E', width: 214, height: 48, borderRadius: 24, padding: 4 },
  slidingBg: { position: 'absolute', backgroundColor: '#FFF', width: 104, height: 40, borderRadius: 20, top: 4 },
  toggleBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  toggleText: { color: '#8E8E93', fontSize: 14, fontWeight: '600' },
  activeTabText: { color: '#000' },
  formContainer: { width: '100%', gap: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  fullInput: { width: '100%' },
  label: { color: '#FFF', fontSize: 13, marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#1C1C1E', color: '#FFF', borderRadius: 12, height: 48, paddingHorizontal: 15 },
  switchLink: { color: '#8E8E93', fontSize: 13, marginTop: 10 },
  genderBox: { flexDirection: 'row', backgroundColor: '#1C1C1E', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'space-around' },
  genderText: { color: '#444', fontSize: 12 },
  genderTextActive: { color: '#FFF', backgroundColor: '#444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  dropdown: { flexDirection: 'row', backgroundColor: '#1C1C1E', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  dropdownLabel: { color: '#444', fontSize: 12 },
  mainBtn: { flexDirection: 'row', backgroundColor: '#FFF', paddingVertical: 14, paddingHorizontal: 35, borderRadius: 25, marginTop: 50, alignItems: 'center', gap: 8 },
  mainBtnText: { color: '#000', fontSize: 16, fontWeight: '700' }
});