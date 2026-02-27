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
  ScrollView,
  Modal,
  FlatList
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function AuthScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [gender, setGender] = useState('F');
  const [country, setCountry] = useState('Choose');
  const [showCountryModal, setShowCountryModal] = useState(false);

  // form state
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const countries = ['USA', 'UK', 'Canada', 'Germany', 'France', 'Australia', 'Italy', 'Spain'];

  // Animation for the toggle pill
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

  // helper to send login/signup request
  const sendCredentials = async () => {
    try {
      const endpoint = isLogin ? '/login' : '/signup';
      const body: any = { email, password };
      if (!isLogin) {
        body.username = `${name} ${surname}`;
        body.country = country;
        body.age = parseInt(age, 10) || null;
        body.gender = gender;
      }
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch (err) {
      console.error('auth network error', err);
      return { error: 'Network error' };
    }
  };

  const handleResponse = (data: any) => {
    if (data && data.token && data.user) {
      if (isLogin) router.replace('/dashboard');
      else router.replace('/assessment');
    } else if (data && data.error) {
      setErrorMessage(data.error);
    } else {
      setErrorMessage('Unexpected response from server');
      console.warn('unexpected auth response', data);
    }
    setLoading(false);
  };

  const handleAuth = async () => {
    // basic validation
    if (!email.trim() || !password) {
      setErrorMessage('Email and password are required');
      return;
    }
    if (!isLogin) {
      if (!name.trim() || !surname.trim()) {
        setErrorMessage('Name and surname required');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match');
        return;
      }
      if (country === 'Choose') {
        setErrorMessage('Please select a country');
        return;
      }
    }
    setErrorMessage('');
    setLoading(true);
    const result = await sendCredentials();
    handleResponse(result);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Animated Toggle */}
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

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {!isLogin && (
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="#444"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Surname</Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="#444"
                    value={surname}
                    onChangeText={setSurname}
                  />
                </View>
              </View>
            )}

            <View style={styles.fullInput}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.fullInput}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {!isLogin && (
              <>
                <View style={styles.fullInput}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>

                <View style={styles.row}>
                  {/* Age Input */}
                  <View style={{ width: '22%' }}>
                    <Text style={styles.label}>Age</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      maxLength={2}
                      value={age}
                      onChangeText={setAge}
                    />
                  </View>

                  {/* Gender Selector */}
                  <View style={{ width: '33%' }}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.genderBox}>
                      {['F', 'M', 'ND'].map((g) => (
                        <TouchableOpacity 
                          key={g} 
                          onPress={() => setGender(g)}
                          style={[styles.genderOption, gender === g && styles.genderOptionActive]}
                        >
                          <Text style={[styles.genderLabel, gender === g && styles.genderLabelActive]}>{g}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Country Dropdown Trigger */}
                  <View style={{ width: '38%' }}>
                    <Text style={styles.label}>Country</Text>
                    <TouchableOpacity 
                      style={styles.dropdown} 
                      onPress={() => setShowCountryModal(true)}
                    >
                      <Text style={[styles.dropdownLabel, country !== 'Choose' && { color: 'white' }]}>
                        {country}
                      </Text>
                      <Ionicons name="chevron-down" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {isLogin && (
              <TouchableOpacity onPress={() => setIsLogin(false)}>
                <Text style={styles.switchLink}>Don't have an account? Go to Sign Up</Text>
              </TouchableOpacity>
            )}
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <TouchableOpacity style={[styles.mainBtn, loading && { opacity: 0.6 }]} onPress={handleAuth} disabled={loading}>
            <Text style={styles.mainBtnText}>{loading ? 'Please wait...' : isLogin ? 'Log In' : 'Sign Up'}</Text>
            <Ionicons name="chevron-forward" size={20} color="black" />
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Selection Modal */}
      <Modal visible={showCountryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={countries}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.countryItem} 
                  onPress={() => {
                    setCountry(item);
                    setShowCountryModal(false);
                  }}
                >
                  <Text style={styles.countryItemText}>{item}</Text>
                  {country === item && <Ionicons name="checkmark" size={20} color="white" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  
  // Gender Box Styles
  genderBox: { flexDirection: 'row', backgroundColor: '#1C1C1E', borderRadius: 12, height: 48, padding: 4 },
  errorText: { color: '#FF4D4F', marginTop: 10, fontSize: 14, textAlign: 'center' },
  genderOption: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  genderOptionActive: { backgroundColor: '#444' },
  genderLabel: { color: '#444', fontSize: 12 },
  genderLabelActive: { color: '#FFF' },

  // Dropdown Styles
  dropdown: { flexDirection: 'row', backgroundColor: '#1C1C1E', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  dropdownLabel: { color: '#444', fontSize: 12 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 25, borderTopRightRadius: 25, height: height * 0.5, padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  countryItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: '#333' },
  countryItemText: { color: 'white', fontSize: 16 },

  mainBtn: { flexDirection: 'row', backgroundColor: '#FFF', paddingVertical: 14, paddingHorizontal: 35, borderRadius: 25, marginTop: 50, alignItems: 'center', gap: 8 },
  mainBtnText: { color: '#000', fontSize: 16, fontWeight: '700' }
});