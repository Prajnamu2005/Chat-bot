import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  TextInput,
  Modal,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useChatStore } from '../store/chatStore';
import { RootStackParamList, Chat } from '../types';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { ThemeColors } from '../theme/colors';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ChatListScreen() {
  const navigation = useNavigation<Nav>();
  const { chats, loadChats, createNewChat, deleteChat, renameChat } = useChatStore();
  const { colors, isDark, toggleTheme } = useTheme();
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Chat | null>(null);
  const [renameText, setRenameText] = useState('');
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Chat | null>(null);

  const styles = makeStyles(colors);

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
    setDeleteTarget(chat);
    setDeleteVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await deleteChat(deleteTarget.id);
    }
    setDeleteVisible(false);
    setDeleteTarget(null);
  };

  const handleRenameOpen = (chat: Chat) => {
    setRenameTarget(chat);
    setRenameText(chat.title);
    setRenameVisible(true);
  };

  const handleRenameSave = async () => {
    const trimmed = renameText.trim();
    if (trimmed && renameTarget) {
      await renameChat(renameTarget.id, trimmed);
    }
    setRenameVisible(false);
    setRenameTarget(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat-Bot</Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          <MaterialIcons
            name={isDark ? 'brightness-3' : 'wb-sunny'}
            size={22}
            color="#FFFFFF"
          />
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
            <Pressable
              style={styles.chatItem}
              onPress={() => handleSelectChat(item.id)}
            >
              <View style={styles.chatLeft}>
                <Text style={styles.chatTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.chatDate}>
                  {new Date(item.updatedAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleRenameOpen(item)}
                  onPressIn={(e) => e.stopPropagation()}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteChat(item)}
                  onPressIn={(e) => e.stopPropagation()}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.deleteBtnText}>X</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={handleNewChat}>
        <Text style={styles.fabText}>+ New Chat</Text>
      </TouchableOpacity>

      <Modal visible={renameVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setRenameVisible(false)}>
          <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Rename Chat</Text>
            <TextInput
              style={styles.modalInput}
              value={renameText}
              onChangeText={setRenameText}
              placeholder="Enter new name"
              placeholderTextColor={colors.placeholder}
              autoFocus
              selectTextOnFocus
              maxLength={50}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setRenameVisible(false)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSave} onPress={handleRenameSave}>
                <Text style={styles.modalBtnSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={deleteVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setDeleteVisible(false)}>
          <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Delete Chat</Text>
            <Text style={styles.modalText}>
              {deleteTarget ? `Delete "${deleteTarget.title}"? This cannot be undone.` : ''}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setDeleteVisible(false)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnDelete} onPress={handleDeleteConfirm}>
                <Text style={styles.modalBtnDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 50,
      paddingBottom: 12,
      backgroundColor: colors.primary,
    },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', position: 'absolute', left: 0, right: 0, textAlign: 'center' },
    themeToggle: {
      padding: 8,
      marginRight: 4,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.4)',
    },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 18, color: colors.textLight },
    emptySubtext: { fontSize: 14, color: colors.placeholder, marginTop: 8 },
    chatItem: {
      backgroundColor: colors.surface,
      padding: 16,
      marginHorizontal: 12,
      marginVertical: 4,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    chatLeft: {
      flex: 1,
      justifyContent: 'center',
    },
    chatTitle: { fontSize: 16, fontWeight: '500', color: colors.text },
    chatDate: { fontSize: 12, color: colors.textLight, marginTop: 4 },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 12,
      gap: 8,
    },
    editBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: colors.background,
    },
    editBtnText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
    deleteBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: isDarkColor(colors) ? '#3A1515' : '#FFF0F0',
    },
    deleteBtnText: { fontSize: 13, color: colors.error, fontWeight: '600' },
    separator: { height: 0 },
    fab: {
      position: 'absolute',
      bottom: 24,
      alignSelf: 'center',
      backgroundColor: colors.primary,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalBox: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      width: '80%',
      maxWidth: 340,
    },
    modalTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 8 },
    modalText: { fontSize: 14, color: colors.textLight, marginBottom: 16, lineHeight: 20 },
    modalInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      color: colors.text,
      backgroundColor: colors.background,
    },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 12 },
    modalBtnCancel: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
    modalBtnCancelText: { fontSize: 15, color: colors.textLight },
    modalBtnSave: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    modalBtnSaveText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
    modalBtnDelete: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: colors.error,
    },
    modalBtnDeleteText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
  });
}

function isDarkColor(colors: ThemeColors): boolean {
  return colors.background === '#1A1A2E';
}
