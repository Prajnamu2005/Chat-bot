import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types';
import { useTheme } from '../theme/ThemeContext';
import { ThemeColors } from '../theme/colors';

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const { colors } = useTheme();
  const isUser = message.role === 'user';

  const styles = makeStyles(colors);

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

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { marginVertical: 4, marginHorizontal: 12 },
    userContainer: { alignItems: 'flex-end' },
    assistantContainer: { alignItems: 'flex-start' },
    bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
    userBubble: { backgroundColor: colors.userBubble, borderBottomRightRadius: 4 },
    assistantBubble: { backgroundColor: colors.assistantBubble, borderBottomLeftRadius: 4 },
    text: { fontSize: 15, lineHeight: 20 },
    userText: { color: colors.userBubbleText },
    assistantText: { color: colors.assistantBubbleText },
  });
}
