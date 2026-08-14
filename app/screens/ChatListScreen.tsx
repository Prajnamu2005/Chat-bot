import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useChatStore } from '../store/chatStore';
import { RootStackParamList, Chat } from '../types';
import { Colors } from '../theme/colors';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ChatListScreen() {
  const navigation = useNavigation<Nav>();
  const { chats, loadChats, createNewChat, deleteChat } = useChatStore();

  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [])
  );

  const handleNewChat = async () => {
    const id = await createNewChat();
    navigation.navigate('Chat', { chatId: id });
  };

  const handleSelectChat = (chatId: string) => {
    navigation.navigate('Chat', { chatId });
  };

  const handleDeleteChat = (chat: Chat) => {
    Alert.alert('Delete Chat', `Delete "${chat.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteChat(chat.id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Chat</Text>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsBtnText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {chats.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>Tap the button below to start chatting</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() => handleSelectChat(item.id)}
              onLongPress={() => handleDeleteChat(item)}
            >
              <Text style={styles.chatTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.chatDate}>
                {new Date(item.updatedAt).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={handleNewChat}>
        <Text style={styles.fabText}>+ New Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: Colors.primary,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  settingsBtn: { padding: 8 },
  settingsBtnText: { color: '#FFFFFF', fontSize: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: Colors.textLight },
  emptySubtext: { fontSize: 14, color: Colors.placeholder, marginTop: 8 },
  chatItem: {
    backgroundColor: Colors.surface,
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
  },
  chatTitle: { fontSize: 16, fontWeight: '500', color: Colors.text },
  chatDate: { fontSize: 12, color: Colors.textLight, marginTop: 4 },
  separator: { height: 0 },
  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
