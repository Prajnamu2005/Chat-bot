import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export default function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(value, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      );
    const anim = Animated.parallel([animate(dot1, 0), animate(dot2, 200), animate(dot3, 400)]);
    anim.start();
    return () => anim.stop();
  }, []);

  const dotStyle = (opacity: Animated.Value) => ({
    opacity,
    transform: [{ scale: opacity.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, dotStyle(dot1)]} />
      <Animated.View style={[styles.dot, dotStyle(dot2)]} />
      <Animated.View style={[styles.dot, dotStyle(dot3)]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 4,
    backgroundColor: Colors.assistantBubble,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    gap: 4,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textLight, marginHorizontal: 2 },
});
