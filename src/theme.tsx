// src/theme.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark" | "system";

export type Theme = {
  background: string;
  card: string;
  cardLite: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentText: string;
  danger: string;
  border: string;
  chipBg: string;
  chipActiveBg: string;
  chipText: string;
  chipTextActive: string;
  headerText: string;
};

const BG = "#F7EEDB";
const PURPLE_BG = "#461D7C";

export const THEME_LIGHT: Theme = {
  background: BG,
  card: "#f5f5f5",
  cardLite: "#FAD03C",
  textPrimary: "#222222",
  textSecondary: "#666666",
  accent: "#461D7C",
  accentText: "#FFFFFF",
  danger: "#C62828",
  border: "#DDDDDD",
  chipBg: "#FFFFFF",
  chipActiveBg: "#EEE5FF",
  chipText: "#444444",
  chipTextActive: "#461D7C",
  headerText: "#555555",
};

export const THEME_DARK: Theme = {
  background: PURPLE_BG,
  card: "#2B0F4A",
  cardLite: "#2B0F4A",
  textPrimary: "#F7EEDB",
  textSecondary: "#D3C7F5",
  accent: "#FAD03C", // gold
  accentText: "#2B0F4A",
  danger: "#FF8A80",
  border: "#6A4FA3",
  chipBg: "#3C205F",
  chipActiveBg: "#FAD03C22",
  chipText: "#F7EEDB",
  chipTextActive: "#FAD03C",
  headerText: "#F7EEDB",
};

type ThemeContextValue = {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");

  // Load saved theme once
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("themeMode");
        if (saved === "light" || saved === "dark" || saved === "system") {
          setThemeModeState(saved);
        }
      } catch (e) {
        console.log("Error loading theme mode", e);
      }
    })();
  }, []);

  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" && systemScheme === "dark");

  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem("themeMode", mode);
    } catch (e) {
      console.log("Error saving theme mode", e);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}