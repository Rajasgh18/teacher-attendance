import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

export interface Colors {
  // Background colors
  background: string;
  surface: string;
  surfaceVariant: string;
  surfaceElevated: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Primary colors
  primary: string;
  primaryContainer: string;
  onPrimary: string;
  onPrimaryContainer: string;

  // Secondary colors
  secondary: string;
  secondaryContainer: string;
  onSecondary: string;
  onSecondaryContainer: string;

  // Status colors
  success: string;
  successContainer: string;
  error: string;
  errorContainer: string;
  warning: string;
  warningContainer: string;
  info: string;
  infoContainer: string;

  // Border and divider colors
  border: string;
  divider: string;
  outline: string;

  // Overlay colors
  overlay: string;
  backdrop: string;

  // Shadow colors
  shadow: string;

  // Special colors
  disabled: string;
  disabledContainer: string;
  ripple: string;
}

const lightColors: Colors = {
  background: "#ffffff",
  surface: "#ffffff",
  surfaceVariant: "#f4f4f5",
  surfaceElevated: "#ffffff",

  text: "#09090b",
  textSecondary: "#74747a",
  textTertiary: "#a1a1aa",
  textInverse: "#ffffff",

  primary: "#2533eb",
  primaryContainer: "#fff1f2",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#09090b",

  secondary: "#f4f4f5",
  secondaryContainer: "#ffffff",
  onSecondary: "#18181b",
  onSecondaryContainer: "#09090b",

  success: "#10b981",
  successContainer: "#dcfce7",
  error: "#ef4444",
  errorContainer: "#fee2e2",
  warning: "#f59e0b",
  warningContainer: "#fef3c7",
  info: "#3b82f6",
  infoContainer: "#dbeafe",

  border: "#e4e4e7",
  divider: "#e4e4e7",
  outline: "#e4e4e7",

  overlay: "rgba(0, 0, 0, 0.15)",
  backdrop: "rgba(0, 0, 0, 0.4)",
  shadow: "rgba(0, 0, 0, 0.1)",

  disabled: "#a1a1aa",
  disabledContainer: "#f4f4f5",
  ripple: "rgba(0, 0, 0, 0.1)",
};

const darkColors: Colors = {
  background: "#0c0a09",
  surface: "#1c1917",
  surfaceVariant: "#262626",
  surfaceElevated: "#27272a",

  text: "#f2f2f2",
  textSecondary: "#a1a1aa",
  textTertiary: "#71717a",
  textInverse: "#0c0a09",

  primary: "#2533eb",
  primaryContainer: "#881337",
  onPrimary: "#fff1f2",
  onPrimaryContainer: "#0c0a09",

  secondary: "#27272a",
  secondaryContainer: "#2e2928",
  onSecondary: "#fafafa",
  onSecondaryContainer: "#0c0a09",

  success: "#34d399",
  successContainer: "#065f46",
  error: "#ef4444",
  errorContainer: "#7f1d1d",
  warning: "#fbbf24",
  warningContainer: "#92400e",
  info: "#60a5fa",
  infoContainer: "#1e3a8a",

  border: "#27272a",
  divider: "#3f3f46",
  outline: "#52525b",

  overlay: "rgba(255, 255, 255, 0.1)",
  backdrop: "rgba(0, 0, 0, 0.5)",
  shadow: "rgba(0, 0, 0, 0.3)",

  disabled: "#52525b",
  disabledContainer: "#27272a",
  ripple: "rgba(255, 255, 255, 0.1)",
};

interface ThemeContextType {
  colors: Colors;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");

  // Determine if we should use dark mode
  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" && systemColorScheme === "dark");

  // Get the appropriate colors based on the current theme
  const colors = isDark ? darkColors : lightColors;

  const toggleTheme = () => {
    setThemeMode(prev => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      return "light";
    });
  };

  // Update theme when system color scheme changes
  useEffect(() => {
    if (themeMode === "system") {
      setThemeMode(systemColorScheme === "dark" ? "dark" : "light");
    } else {
      setThemeMode(systemColorScheme as ThemeMode);
    }
  }, [systemColorScheme, themeMode]);

  return (
    <ThemeContext.Provider
      value={{
        colors,
        themeMode,
        isDark,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
