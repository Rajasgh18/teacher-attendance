import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { WifiOff } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useConnectivity } from "@/hooks/useConnectivity";

export const ConnectivityBanner = () => {
  const { colors } = useTheme();
  const { isOffline } = useConnectivity();

  if (!isOffline) {
    return null;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.errorContainer }]}
    >
      <WifiOff size={16} color={colors.error} />
      <Text style={[styles.text, { color: colors.error }]}>
        You're offline. Some features may be limited.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
  },
});
