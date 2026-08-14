import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getApiKey, setApiKey, clearApiKey } from '../services/geminiService';
import { useChatStore } from '../store/chatStore';
import { Colors } from '../theme/colors';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [apiKey, setLocalApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const { clearAllChats } = useChatStore();

  useEffect(() => {
    getApiKey().then((key) => {
      if (key) setLocalApiKey(key);
    });
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }
    await setApiKey(apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearKey = async () => {
    Alert.alert('Clear API Key', 'Remove saved API key?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearApiKey();
          setLocalApiKey('');
        },
      },
    ]);
  };

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

      <Text style={styles.sectionTitle}>Gemini API Key</Text>
      <Text style={styles.hint}>
        Get your API key from Google AI Studio (aistudio.google.com)
      </Text>
      <TextInput
        style={styles.input}
        value={apiKey}
        onChangeText={setLocalApiKey}
        placeholder="Enter your Gemini API key"
        placeholderTextColor={Colors.placeholder}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{saved ? 'Saved!' : 'Save Key'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearBtn} onPress={handleClearKey}>
          <Text style={styles.clearBtnText}>Clear Key</Text>
        </TouchableOpacity>
      </View>

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
  hint: { fontSize: 13, color: Colors.textLight, marginHorizontal: 16, marginTop: 4, marginBottom: 8 },
  input: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: Colors.surface,
    color: Colors.text,
  },
  buttonRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, gap: 12 },
  saveBtn: { flex: 1, backgroundColor: Colors.primary, padding: 12, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  clearBtn: { flex: 1, borderWidth: 1, borderColor: Colors.border, padding: 12, borderRadius: 10, alignItems: 'center' },
  clearBtnText: { color: Colors.text, fontSize: 15 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 24, marginHorizontal: 16 },
  dangerBtn: { marginHorizontal: 16, backgroundColor: Colors.error, padding: 12, borderRadius: 10, alignItems: 'center' },
  dangerBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
});
