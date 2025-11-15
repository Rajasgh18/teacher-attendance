import {
  View,
  Text,
  Modal,
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const { width } = Dimensions.get("window");

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

export interface AlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: AlertButton[];
  type?: "success" | "error" | "info" | "warning";
  onDismiss?: () => void;
}

const Alert: React.FC<AlertProps> = ({
  visible,
  title,
  message,
  buttons = [],
  onDismiss,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleBackdropPress = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={[styles.backdrop, { backgroundColor: colors.backdrop }]}
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <Animated.View
          style={[
            styles.backdrop,
            {
              backgroundColor: colors.backdrop,
              opacity: opacityAnim,
            },
          ]}
        />
      </TouchableOpacity>
      {/* Alert Container */}
      <View style={styles.container}>
        <View
          style={[
            styles.alertContainer,
            { backgroundColor: colors.surface, shadowColor: colors.shadow },
          ]}
        >
          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

          {/* Message */}
          <Text style={[styles.message, { color: colors.text }]}>
            {message}
          </Text>

          {/* Buttons */}
          {buttons.length > 0 && (
            <View
              style={[styles.buttonContainer, { borderColor: colors.border }]}
            >
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    { borderColor: colors.border },
                    index === 0 && { borderLeftWidth: 0 },
                    button.style === "destructive" && styles.destructiveButton,
                    button.text === "Cancel" && styles.cancelButton,
                    buttons.length === 1 && styles.singleButton,
                  ]}
                  onPress={() => handleButtonPress(button)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: colors.text },
                      button.style === "destructive" && { color: colors.error },
                      button.text === "Cancel" && { color: colors.error },
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Default OK button if no buttons provided */}
          {buttons.length === 0 && (
            <View
              style={[styles.buttonContainer, { borderColor: colors.border }]}
            >
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.singleButton,
                  { borderLeftWidth: 0 },
                ]}
                onPress={onDismiss}
              >
                <Text style={[styles.buttonText, { color: colors.text }]}>
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default Alert;

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    paddingTop: 20,
    borderRadius: 14,
    width: width - 40,
    maxWidth: width - 80,
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
    overflow: "hidden",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    borderTopWidth: 0.5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    flex: 1,
    borderLeftWidth: 0.5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  singleButton: {
    borderBottomWidth: 0,
  },
  destructiveButton: {
    // iOS destructive button styling
  },
  cancelButton: {
    // iOS cancel button styling
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "400",
  },
});
