import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Student } from "@/types";

interface StudentMarksInputProps {
  student: Student;
  marks: number;
  onMarksChange: (studentId: string, marks: number) => void;
}

export const StudentMarksInput: React.FC<StudentMarksInputProps> = ({
  student,
  marks,
  onMarksChange,
}) => {
  const { colors } = useTheme();

  const handleMarksChange = (text: string) => {
    const newMarks = parseInt(text, 10) || 0;
    // Ensure marks are between 0 and 100
    const validMarks = Math.max(0, Math.min(100, newMarks));
    onMarksChange(student.studentId, validMarks);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.studentInfo}>
        <Text style={[styles.studentName, { color: colors.text }]}>
          {student.firstName} {student.lastName}
        </Text>
        {student.email && (
          <Text style={[styles.studentId, { color: colors.textSecondary }]}>
            {student.email}
          </Text>
        )}
      </View>
      <View style={styles.marksInputContainer}>
        <TextInput
          style={[
            styles.marksInput,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="0-100"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          value={marks.toString()}
          onChangeText={handleMarksChange}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  studentId: {
    fontSize: 12,
  },
  marksInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  marksInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    textAlign: "center",
  },
});
