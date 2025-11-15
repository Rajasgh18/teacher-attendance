import {
  View,
  Text,
  Easing,
  Animated,
  StatusBar,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { GraduationCap } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

const SplashScreen = () => {
  const { colors, isDark } = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation animation for background elements
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Pulse animation for loading indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Animated background elements */}
      <View style={styles.backgroundContainer}>
        <Animated.View
          style={[
            styles.backgroundCircle1,
            {
              backgroundColor: colors.primaryContainer,
              opacity: isDark ? 0.1 : 0.15,
              transform: [{ rotate: rotateInterpolate }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.backgroundCircle2,
            {
              backgroundColor: colors.secondaryContainer,
              opacity: isDark ? 0.08 : 0.12,
              transform: [{ rotate: rotateInterpolate }],
            },
          ]}
        />
        <View style={styles.geometricPattern}>
          <View
            style={[
              styles.geometricShape1,
              {
                backgroundColor: colors.primaryContainer,
                opacity: isDark ? 0.05 : 0.08,
              },
            ]}
          />
          <View
            style={[
              styles.geometricShape2,
              {
                backgroundColor: colors.secondaryContainer,
                opacity: isDark ? 0.03 : 0.06,
              },
            ]}
          />
        </View>
      </View>

      {/* Main content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          },
        ]}
      >
        {/* Logo section with enhanced design */}
        <View style={styles.logoSection}>
          <View
            style={[styles.logoContainer, { backgroundColor: colors.primary }]}
          >
            <View
              style={[styles.logoInner, { backgroundColor: colors.overlay }]}
            >
              <GraduationCap
                size={32}
                color={colors.onPrimary}
                strokeWidth={2}
              />
            </View>
          </View>

          {/* Decorative elements around logo */}
          <View style={styles.logoDecorations}>
            <View
              style={[
                styles.decorationDot1,
                { backgroundColor: colors.secondary },
              ]}
            />
            <View
              style={[
                styles.decorationDot2,
                { backgroundColor: colors.success },
              ]}
            />
            <View
              style={[styles.decorationDot3, { backgroundColor: colors.info }]}
            />
          </View>
        </View>

        {/* Title section with improved typography */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.text }]}>
            Teacher Attendance
          </Text>
          <View
            style={[styles.titleUnderline, { backgroundColor: colors.border }]}
          />
        </View>

        {/* Subtitle with better styling */}
        <View style={styles.subtitleSection}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Professional attendance management system
          </Text>
        </View>
      </Animated.View>

      {/* Enhanced loading indicator */}
      <Animated.View
        style={[styles.loadingContainer, { transform: [{ scale: pulseAnim }] }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundCircle1: {
    position: "absolute",
    top: height * 0.05,
    right: -width * 0.15,
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
  },
  backgroundCircle2: {
    position: "absolute",
    bottom: height * 0.15,
    left: -width * 0.1,
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: width * 0.1,
  },
  geometricPattern: {
    position: "absolute",
    top: height * 0.4,
    right: width * 0.05,
  },
  geometricShape1: {
    width: 40,
    height: 40,
    borderRadius: 8,
    transform: [{ rotate: "45deg" }],
  },
  geometricShape2: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: "absolute",
    top: 20,
    right: -10,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    flex: 1,
  },
  logoSection: {
    marginBottom: 48,
    position: "relative",
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  logoDecorations: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorationDot1: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  decorationDot2: {
    position: "absolute",
    bottom: -5,
    left: -5,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  decorationDot3: {
    position: "absolute",
    top: 50,
    right: -15,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  titleSection: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    borderRadius: 2,
  },
  subtitleSection: {
    marginBottom: 48,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  loadingContainer: {
    position: "absolute",
    bottom: 100,
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 40,
  },
});

export default SplashScreen;
