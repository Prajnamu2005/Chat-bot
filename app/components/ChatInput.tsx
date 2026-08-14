import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Keyboard } from 'react-native';
import { Colors } from '../theme/colors';

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Type a message..."
        placeholderTextColor={Colors.placeholder}
        multiline
        maxLength={2000}
        editable={!disabled}
      />
      <TouchableOpacity
        style={[styles.button, (!text.trim() || disabled) && styles.buttonDisabled]}
        onPress={handleSend}
        disabled={!text.trim() || disabled}
      >
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    backgroundColor: Colors.inputBackground,
    color: Colors.text,
  },
  button: {
    marginLeft: 8,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
});
