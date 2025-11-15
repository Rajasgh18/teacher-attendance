import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { School, User, Lock } from "lucide-react-native";
import { useNavigation } from "@/navigation";

import { AuthService } from "@/services";
import { useUserStore } from "@/stores/userStore";
import { LabelInput } from "@/components/label-input";
import { useAlert } from "@/contexts/AlertContext";
import { useTheme } from "@/contexts/ThemeContext";

const LoginScreen = () => {
  const { colors } = useTheme();
  const { setUser } = useUserStore();
  const navigation = useNavigation();
  const { showAlert } = useAlert();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!employeeId || !password) {
      showAlert({
        title: "Error",
        message: "Please fill in all fields",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await AuthService.login({ employeeId, password });
      setUser(response.user);
      // Navigate to data sync screen instead of directly to dashboard
      navigation.navigate("DataSync", { user: response.user });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      showAlert({
        title: "Error",
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password
    showAlert({
      title: "Not Implemented",
      message: "Forgot password feature is not implemented yet.",
      type: "info",
    });
  };

  const handleRegister = () => {
    // TODO: Implement register
    showAlert({
      title: "Not Implemented",
      message: "Register feature is not implemented yet.",
      type: "info",
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View>
            {/* Header */}
            <View style={styles.header}>
              <View
                style={[
                  styles.logoContainer,
                  { backgroundColor: colors.primary },
                ]}
              >
                <School size={40} color={colors.onPrimary} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                Welcome Back
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Sign in to your account to continue
              </Text>
            </View>

            {/* Login Form */}
            <View style={styles.form}>
              <LabelInput
                label="Employee ID"
                value={employeeId}
                onChangeText={setEmployeeId}
                icon={User}
                placeholder="Enter your employee ID"
              />
              <LabelInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                type="password"
                icon={Lock}
                placeholder="Enter your password"
              />

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
              >
                <Text
                  style={[styles.forgotPasswordText, { color: colors.primary }]}
                >
                  Forgot your password?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  { backgroundColor: colors.primary },
                  isLoading && { backgroundColor: colors.disabled },
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text
                  style={[styles.loginButtonText, { color: colors.onPrimary }]}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: colors.border },
                  ]}
                />
                <Text
                  style={[styles.dividerText, { color: colors.textSecondary }]}
                >
                  or
                </Text>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: colors.border },
                  ]}
                />
              </View>

              <View style={styles.registerContainer}>
                <Text
                  style={[styles.registerText, { color: colors.textSecondary }]}
                >
                  Don't have an account?{" "}
                </Text>
                <TouchableOpacity onPress={handleRegister}>
                  <Text
                    style={[styles.registerLink, { color: colors.primary }]}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
    flexDirection: "column",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
  },
  form: {
    flexDirection: "column",
    gap: 12,
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    fontWeight: "500",
  },
  loginButton: {
    width: "100%",
    paddingVertical: 12,
    marginTop: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  loginButtonText: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  registerText: {
    // Handled dynamically
  },
  registerLink: {
    fontWeight: "500",
  },
});

export default LoginScreen;
