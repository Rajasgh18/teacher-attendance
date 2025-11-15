import { Appbar } from "@/components/appbar";
import { useTheme } from "@/contexts/ThemeContext";
import { ClassesService } from "@/services";
import { Class } from "@/types";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ClassScreen() {
  const { colors } = useTheme();

  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    ClassesService.getClasses().then(data => setClasses(data));
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView>
        <Appbar showBack={false} title={`Class`} />

        {classes.map(c => (
          <View key={c.id}>
            <Text>{c.grade}</Text>
          </View>
        ))}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
