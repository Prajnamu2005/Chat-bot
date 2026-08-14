import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types';
import { Colors } from '../theme/colors';

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 4, marginHorizontal: 12 },
  userContainer: { alignItems: 'flex-end' },
  assistantContainer: { alignItems: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  userBubble: { backgroundColor: Colors.userBubble, borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: Colors.assistantBubble, borderBottomLeftRadius: 4 },
  text: { fontSize: 15, lineHeight: 20 },
  userText: { color: Colors.userBubbleText },
  assistantText: { color: Colors.assistantBubbleText },
});
