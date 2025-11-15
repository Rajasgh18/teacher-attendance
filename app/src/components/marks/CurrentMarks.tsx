import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Edit, Trash2 } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Subject, Marks } from "@/types";

interface CurrentMarksProps {
  subjects: Subject[];
  marks: Marks[];
  students: any[];
  months: string[];
  onEditMarks: (subjectId: string, month: string) => void;
  onUpdateMarks: (markId: string, newMarks: number) => void;
  onDeleteMarks: (markId: string) => void;
}

export const CurrentMarks: React.FC<CurrentMarksProps> = ({
  subjects,
  marks,
  students,
  months,
  onEditMarks,
  onUpdateMarks,
  onDeleteMarks,
}) => {
  const { colors } = useTheme();

  const handleUpdateMarks = (markId: string, currentMarks: number) => {
    Alert.prompt(
      "Edit Marks",
      "Enter new marks (0-100):",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update",
          onPress: (value?: string) => {
            const newMarks = parseInt(value || "0", 10);
            if (newMarks >= 0 && newMarks <= 100) {
              onUpdateMarks(markId, newMarks);
            } else {
              Alert.alert("Invalid Marks", "Marks must be between 0 and 100", [
                { text: "OK" },
              ]);
            }
          },
        },
      ],
      "plain-text",
      currentMarks.toString(),
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Current Marks
      </Text>

      {subjects.map(subject => (
        <View
          key={subject.id}
          style={[
            styles.subjectSection,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.subjectTitle, { color: colors.text }]}>
            {subject.name}
          </Text>

          {months.map(month => {
            const monthMarks = marks.filter(
              mark => mark.subjectId === subject.id && mark.month === month,
            );

            if (monthMarks.length === 0) return null;

            return (
              <View key={month} style={styles.monthSection}>
                <View style={styles.monthHeader}>
                  <Text
                    style={[styles.monthTitle, { color: colors.textSecondary }]}
                  >
                    {month}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.editMonthButton,
                      { backgroundColor: colors.primary + "20" },
                    ]}
                    onPress={() => onEditMarks(subject.id, month)}
                  >
                    <Edit size={16} color={colors.primary} />
                    <Text
                      style={[
                        styles.editMonthButtonText,
                        { color: colors.primary },
                      ]}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>

                {monthMarks.map(mark => {
                  const student = students.find(s => s.id === mark.studentId);

                  if (!student) return null;

                  return (
                    <View
                      key={mark.id}
                      style={[
                        styles.markRow,
                        { backgroundColor: colors.surface },
                      ]}
                    >
                      <Text
                        style={[styles.studentName, { color: colors.text }]}
                      >
                        {student.firstName} {student.lastName}
                      </Text>
                      <View style={styles.markActions}>
                        <Text
                          style={[styles.markValue, { color: colors.text }]}
                        >
                          {mark.marks}
                        </Text>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleUpdateMarks(mark.id, mark.marks)}
                        >
                          <Edit size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => onDeleteMarks(mark.id)}
                        >
                          <Trash2 size={16} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subjectSection: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  monthSection: {
    marginBottom: 16,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  editMonthButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  editMonthButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  markRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  studentName: {
    fontSize: 14,
    flex: 1,
  },
  markActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  markValue: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 40,
    textAlign: "center",
  },
  actionButton: {
    padding: 4,
  },
});
