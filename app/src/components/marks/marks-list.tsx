import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Marks, Student } from "@/types";
import { Edit } from "lucide-react-native";

interface MarksListProps {
  marks: Marks[];
  students: Student[];
  onEditMarks: () => void;
}

export const MarksList: React.FC<MarksListProps> = ({
  marks,
  students,
  onEditMarks,
}) => {
  const { colors } = useTheme();

  if (marks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No marks available for this subject
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary Statistics */}
      <View>
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            Summary Statistics
          </Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Total Students
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {Array.from(new Set(marks.map(mark => mark.studentId))).length}
              </Text>
            </View>
            <View style={styles.summaryStat}>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Total Marks
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {marks.length}
              </Text>
            </View>
            <View style={styles.summaryStat}>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Overall Average
              </Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>
                {marks.length > 0
                  ? Math.round(
                      (marks.reduce((sum, mark) => sum + mark.marks, 0) /
                        marks.length) *
                        100,
                    ) / 100
                  : 0}
                %
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            Marks Overview
          </Text>
          <TouchableOpacity style={[styles.editButton]} onPress={onEditMarks}>
            <Edit size={16} color={colors.primary} />
            <Text style={[styles.editButtonText, { color: colors.primary }]}>
              Edit Marks
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.tableContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Table Header */}
          <View
            style={[
              styles.tableHeader,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={[styles.headerCell, { width: "75%" }]}>
              <Text style={[styles.headerText, { color: colors.text }]}>
                Student Name
              </Text>
            </View>
            <View style={[styles.headerCell, { width: "25%" }]}>
              <Text style={[styles.headerText, { color: colors.text }]}>
                Marks
              </Text>
            </View>
          </View>
          <ScrollView style={{ maxHeight: 300 }}>
            {marks.map((mark, index) => {
              const studentDetail = students.find(
                student => student.studentId === mark.studentId,
              );

              if (!studentDetail) {
                return null;
              }

              return (
                <View
                  key={index}
                  style={[styles.tableRow, { borderColor: colors.border }]}
                >
                  <View style={[styles.cell, { width: "75%" }]}>
                    <Text style={[styles.cellText, { color: colors.text }]}>
                      {studentDetail.firstName} {studentDetail.lastName}
                    </Text>
                  </View>
                  <View style={[styles.cell, { width: "25%" }]}>
                    <Text style={[styles.cellText, { color: colors.text }]}>
                      {mark.marks}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  tableContainer: {
    borderRadius: 12,
    borderWidth: 1,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderTopStartRadius: 12,
    borderTopEndRadius: 12,
  },
  headerCell: {
    padding: 12,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  headerText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomEndRadius: 12,
    borderBottomStartRadius: 12,
  },
  cell: {
    padding: 12,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  cellText: {
    fontSize: 14,
    textAlign: "center",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryStat: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
