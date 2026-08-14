import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface Props {
  message: string;
  onDismiss: () => void;
}

export default function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
      <TouchableOpacity onPress={onDismiss}>
        <Text style={styles.dismiss}>X</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.error,
    padding: 12,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: { color: '#FFFFFF', flex: 1, fontSize: 14 },
  dismiss: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
});
