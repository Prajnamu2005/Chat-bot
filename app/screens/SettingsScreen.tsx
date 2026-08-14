import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useChatStore } from '../store/chatStore';
import { Colors } from '../theme/colors';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { clearAllChats } = useChatStore();

  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const isConfigured = apiKey && apiKey !== 'your_api_key_here';

  const handleClearData = () => {
    Alert.alert('Clear All Data', 'Delete all chats and messages? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete All', style: 'destructive', onPress: () => clearAllChats() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 50 }} />
      </View>

      <Text style={styles.sectionTitle}>API Configuration</Text>
      <View style={[styles.statusBox, isConfigured ? styles.statusOk : styles.statusError]}>
        <Text style={[styles.statusText, isConfigured ? styles.statusTextOk : styles.statusTextError]}>
          {isConfigured ? 'Gemini API key configured' : 'API key not set - add it to .env file'}
        </Text>
      </View>

      <Text style={styles.hint}>
        API key is loaded from the .env file in the project root.
      </Text>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Data</Text>
      <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData}>
        <Text style={styles.dangerBtnText}>Clear All Chats</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: Colors.primary,
  },
  backBtn: { color: '#FFFFFF', fontSize: 16, padding: 8, width: 50 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 24, marginHorizontal: 16 },
  hint: { fontSize: 13, color: Colors.textLight, marginHorizontal: 16, marginTop: 8, marginBottom: 8 },
  statusBox: { marginHorizontal: 16, padding: 12, borderRadius: 10, marginTop: 8 },
  statusOk: { backgroundColor: '#E8F5E9' },
  statusError: { backgroundColor: '#FFEBEE' },
  statusText: { fontSize: 14, fontWeight: '500' },
  statusTextOk: { color: '#2E7D32' },
  statusTextError: { color: '#C62828' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 24, marginHorizontal: 16 },
  dangerBtn: { marginHorizontal: 16, backgroundColor: Colors.error, padding: 12, borderRadius: 10, alignItems: 'center' },
  dangerBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
});