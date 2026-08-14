import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Colors as LightColors } from './colors';

const DarkColors = {
  ...LightColors,
  background: '#1A1A2E',
  surface: '#16213E',
  text: '#EAEAEA',
  textLight: '#AAAAAA',
  assistantBubble: '#2A2A4A',
  assistantBubbleText: '#EAEAEA',
  border: '#333355',
  inputBackground: '#16213E',
  placeholder: '#777799',
};

type ThemeType = 'light' | 'dark';
type ColorsType = typeof LightColors;

interface ThemeContextValue {
  isDark: boolean;
  colors: ColorsType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  colors: LightColors,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const colors = isDark ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
