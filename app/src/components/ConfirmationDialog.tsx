import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Modal } from "./Modal";

interface ConfirmationDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  subMessage?: string;
  confirmText?: string;
  cancelText?: string;
  type?: "info" | "warning" | "danger";
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  subMessage,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
}) => {
  const { colors } = useTheme();

  const getTypeColors = () => {
    switch (type) {
      case "warning":
        return colors.primary;
      case "danger":
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const typeColors = getTypeColors();

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      showCloseButton={false}
    >
      <View style={styles.content}>
        <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
        {subMessage && (
          <Text style={[styles.subMessage, { color: colors.textSecondary }]}>
            {subMessage}
          </Text>
        )}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: "transparent",
                borderColor: colors.border,
              },
            ]}
            onPress={onClose}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>
              {cancelText}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              {
                borderColor: "transparent",
                backgroundColor: typeColors,
              },
            ]}
            onPress={() => {
              onConfirm();
              onClose();
            }}
          >
            <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
              {confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  subMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
