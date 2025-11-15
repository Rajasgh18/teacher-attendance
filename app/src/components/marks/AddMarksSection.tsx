import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Plus } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface AddMarksSectionProps {
  onAddMarks: () => void;
}

export const AddMarksSection: React.FC<AddMarksSectionProps> = ({
  onAddMarks,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Add Marks
        </Text>
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={onAddMarks}
        >
          <Plus size={20} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
