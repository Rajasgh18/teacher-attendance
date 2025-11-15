import React from "react";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Wifi, WifiOff } from "lucide-react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { useConnectivity } from "@/hooks/useConnectivity";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";

interface AppbarProps {
  title: string;
  showBack?: boolean;
  subtitle?: string;
  trailing?: React.ReactNode;
}

export const Appbar = ({
  title,
  subtitle,
  trailing,
  showBack = true,
}: AppbarProps) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { isOnline } = useConnectivity();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {showBack && (
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
      )}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <View style={styles.trailingContainer}>
        {/* Connectivity Status */}
        <View style={styles.connectivityContainer}>
          {isOnline ? (
            <Wifi size={20} color={colors.success} />
          ) : (
            <WifiOff size={20} color={colors.error} />
          )}
        </View>
        {trailing}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  trailingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  connectivityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
