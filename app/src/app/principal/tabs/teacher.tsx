import { Appbar } from "@/components/appbar";
import { useTheme } from "@/contexts/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TeacherScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView>
        <Appbar showBack={false} title="Teacher" />
        <Text>Hello</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
