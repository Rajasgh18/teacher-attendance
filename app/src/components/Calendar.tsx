import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { AttendanceStatus } from "@/types/attendance";

interface CalendarProps {
  currentMonth: Date;
  attendanceData: Array<{
    date: number;
    status: AttendanceStatus;
  }>;
  onDayPress?: (date: Date) => void;
  onMonthChange?: (direction: "prev" | "next") => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  currentMonth,
  attendanceData,
  onMonthChange,
}) => {
  const { colors } = useTheme();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];

    // Add empty days for padding
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getAttendanceForDate = (date: Date) => {
    return attendanceData.find(
      att => new Date(att.date).toDateString() === date.toDateString(),
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return colors.success;
      case "absent":
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString([], { month: "long", year: "numeric" });
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <View
      style={[
        styles.calendarContainer,
        { borderColor: colors.border, backgroundColor: colors.surface },
      ]}
    >
      <View style={styles.calendarHeader}>
        <TouchableOpacity
          onPress={() => onMonthChange?.("prev")}
          style={styles.monthButton}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.monthTitle, { color: colors.text }]}>
          {getMonthName(currentMonth)}
        </Text>
        <TouchableOpacity
          onPress={() => onMonthChange?.("next")}
          style={styles.monthButton}
        >
          <ChevronRight size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {/* Day headers */}
        <View style={styles.dayHeaders}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <View key={day} style={styles.dayHeader}>
              <Text
                style={[styles.dayHeaderText, { color: colors.textSecondary }]}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Calendar days */}
        <View style={styles.calendarDays}>
          {Array.from(
            {
              length: Math.ceil(days.length / 7),
            },
            (_, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {Array.from({ length: 7 }, (__, dayIndex) => {
                  const dateIndex = weekIndex * 7 + dayIndex;
                  const date = days[dateIndex];

                  if (!date) {
                    return <View key={dayIndex} style={styles.emptyDay} />;
                  }

                  const attendanceRecord = getAttendanceForDate(date);
                  const isCurrentDay = isToday(date);

                  return (
                    <View key={dayIndex} style={styles.calendarDay}>
                      {attendanceRecord ? (
                        <View
                          style={[
                            styles.dayWithAttendance,
                            { borderColor: colors.border },
                            {
                              backgroundColor: getStatusColor(
                                attendanceRecord.status,
                              ),
                            },
                            isCurrentDay && {
                              borderColor: colors.primary,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.dayNumber,
                              { color: colors.onPrimary },
                            ]}
                          >
                            {date.getDate()}
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.dayWithoutAttendance,
                            { borderColor: colors.border },
                            isCurrentDay && {
                              borderColor: colors.primary,
                              backgroundColor: colors.primaryContainer,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.dayNumberEmpty,
                              { color: colors.textSecondary },
                              isCurrentDay && {
                                color: colors.primary,
                                fontWeight: "bold",
                              },
                            ]}
                          >
                            {date.getDate()}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ),
          )}
        </View>
      </View>

      {/* Legend */}
      <View style={[styles.legend, { borderTopColor: colors.border }]}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDotPresent,
              { backgroundColor: colors.success },
            ]}
          />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Present
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDotAbsent, { backgroundColor: colors.error }]}
          />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Absent
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDotToday,
              {
                borderColor: colors.primary,
                backgroundColor: colors.primaryContainer,
              },
            ]}
          />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Today
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    flexDirection: "column",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 16,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  calendarGrid: {
    flexDirection: "column",
    gap: 8,
  },
  dayHeaders: {
    flexDirection: "row",
  },
  dayHeader: {
    flex: 1,
    alignItems: "center",
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: "500",
  },
  calendarDays: {
    gap: 8,
  },
  weekRow: {
    flexDirection: "row",
    gap: 8,
  },
  emptyDay: {
    flex: 1,
    aspectRatio: 1,
  },
  calendarDay: {
    flex: 1,
    aspectRatio: 1,
  },
  dayWithAttendance: {
    flex: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  dayWithoutAttendance: {
    flex: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: "bold",
  },
  dayNumberEmpty: {
    fontSize: 12,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDotPresent: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendDotAbsent: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendDotToday: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
  },
});
