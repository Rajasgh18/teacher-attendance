import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal as RNModal,
  Pressable,
  ScrollView,
} from "react-native";
import { X } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  maxHeight?: number;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  maxHeight = 300,
}) => {
  const { colors } = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.overlay, { backgroundColor: colors.backdrop }]}
        onPress={onClose}
      >
        <View
          style={[
            styles.content,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              maxHeight,
            },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {showCloseButton && (
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </Pressable>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    maxHeight: 400,
  },
});
