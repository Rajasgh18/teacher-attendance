import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LucideIcon, Eye, EyeOff } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface LabelInputProps {
  label: string;
  value: string;
  type?: "text" | "password";
  placeholder?: string;
  icon: LucideIcon;
  onChangeText: (text: string) => void;
  onIconPress?: () => void;
}

export const LabelInput = ({
  label,
  value,
  type = "text",
  placeholder = "Enter your email",
  icon: Icon,
  onChangeText,
  onIconPress,
}: LabelInputProps) => {
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const handleIconPress = () => {
    if (type === "password") {
      setShowPassword(!showPassword);
    } else if (onIconPress) {
      onIconPress();
    }
  };

  const getIconColor = () => {
    return colors.textSecondary;
  };

  return (
    <View>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.surface,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={type === "password" && !showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.iconButton} onPress={handleIconPress}>
          {type === "password" ? (
            showPassword ? (
              <EyeOff size={20} color={getIconColor()} />
            ) : (
              <Eye size={20} color={getIconColor()} />
            )
          ) : (
            <Icon size={20} color={getIconColor()} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontWeight: "500",
    marginBottom: 6,
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  iconButton: {
    position: "absolute",
    right: 12,
    top: 10,
  },
});
