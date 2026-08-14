import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { useChatStore } from '../store/chatStore';
import { RootStackParamList, Message } from '../types';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import TypingIndicator from '../components/TypingIndicator';
import ErrorBanner from '../components/ErrorBanner';
import { Colors } from '../theme/colors';

type RouteProps = RouteProp<RootStackParamList, 'Chat'>;

export default function ChatScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { chatId } = route.params;
  const flatListRef = useRef<FlatList>(null);

  const {
    messages,
    isLoading,
    isStreaming,
    streamingText,
    error,
    selectChat,
    sendUserMessage,
    clearError,
  } = useChatStore();

  useEffect(() => {
    selectChat(chatId);
  }, [chatId]);

  useEffect(() => {
    if (messages.length > 0 || isStreaming) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, streamingText]);

  const handleSend = useCallback(
    (text: string) => {
      sendUserMessage(text);
    },
    [sendUserMessage]
  );

  const allMessages = [...messages];
  if (isStreaming && streamingText) {
    allMessages.push({
      id: 'streaming',
      chatId,
      role: 'assistant',
      content: streamingText,
      timestamp: Date.now(),
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Chat</Text>
        <View style={{ width: 50 }} />
      </View>

      {error && <ErrorBanner message={error} onDismiss={clearError} />}

      <FlatList
        ref={flatListRef}
        data={allMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {isStreaming && !streamingText && <TypingIndicator />}

      <ChatInput onSend={handleSend} disabled={isLoading} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: Colors.primary,
  },
  backBtn: { padding: 8, width: 50 },
  backBtnText: { color: '#FFFFFF', fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', flex: 1, textAlign: 'center' },
  messageList: { paddingVertical: 8, paddingBottom: 8 },
});
