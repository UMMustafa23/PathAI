import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Dimensions 
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Profile() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.editButton}>
          <Feather name="edit-3" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: 'https://via.placeholder.com/150' }} 
              style={styles.avatar} 
            />
            <View style={styles.onlineBadge} />
          </View>
          <Text style={styles.userName}>Alex Johnson</Text>
          <Text style={styles.userEmail}>alex.j@design.com</Text>
        </View>

        {/* Mini Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={[styles.statBox, styles.statBorder]}>
            <Text style={styles.statValue}>85%</Text>
            <Text style={styles.statLabel}>Focus</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionLabel}>Account Settings</Text>
          
          <MenuButton icon="person-outline" label="Personal Information" />
          <MenuButton icon="notifications-outline" label="Notifications" />
          <MenuButton icon="shield-checkmark-outline" label="Privacy & Security" />
          
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Support</Text>
          <MenuButton icon="help-circle-outline" label="Help Center" />
          <MenuButton icon="chatbubble-outline" label="Feedback" />

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => router.replace('/login')}
          >
            <MaterialIcons name="logout" size={20} color="#FF453A" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const MenuButton = ({ icon, label }: { icon: any, label: string }) => (
  <TouchableOpacity style={styles.menuItem}>
    <View style={styles.menuLeft}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={20} color="#AAA" />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#444" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    height: 60 
  },
  backButton: { padding: 5 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '600' },
  editButton: { padding: 5 },
  scrollContent: { paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginTop: 20 },
  imageContainer: { position: 'relative' },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: '#1C1C1E' },
  onlineBadge: { 
    position: 'absolute', 
    bottom: 5, 
    right: 5, 
    width: 20, 
    height: 20, 
    borderRadius: 10, 
    backgroundColor: '#34C759', 
    borderWidth: 3, 
    borderColor: '#000' 
  },
  userName: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 15 },
  userEmail: { color: '#8E8E93', fontSize: 14, marginTop: 4 },
  statsRow: { 
    flexDirection: 'row', 
    backgroundColor: '#161618', 
    marginHorizontal: 20, 
    marginTop: 30, 
    borderRadius: 20, 
    paddingVertical: 20 
  },
  statBox: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#2C2C2E' },
  statValue: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: '#8E8E93', fontSize: 12, marginTop: 4 },
  menuContainer: { marginTop: 30, paddingHorizontal: 20 },
  sectionLabel: { color: '#444', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 10, marginLeft: 5 },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#161618', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 10 
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#242426', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuLabel: { color: 'white', fontSize: 16, fontWeight: '500' },
  logoutButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 30, 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#331111' 
  },
  logoutText: { color: '#FF453A', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});