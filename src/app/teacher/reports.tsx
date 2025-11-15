import {
  View,
  Text,
  Modal,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  X,
  XCircle,
  Calendar,
  BarChart3,
  TrendingUp,
  CheckCircle,
} from "lucide-react-native";
import { useRoute } from "@react-navigation/native";
import React, { useState, useEffect, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { Appbar } from "@/components/appbar";
import { useAlert } from "@/contexts/AlertContext";
import { useTheme } from "@/contexts/ThemeContext";
import { AttendanceStatus } from "@/types/attendance";
import { DatabaseService } from "@/services/databaseService";
import { format } from "date-fns";

interface AttendanceData {
  date: string;
  present: number;
  absent: number;
  total: number;
  attendanceRate: number;
}

interface StudentAttendanceData {
  studentId: string;
  studentName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendanceRate: number;
}

interface DateRange {
  label: string;
  startDate: number;
  endDate: number;
}

export default function ReportsPage() {
  const route = useRoute();
  const { classId } = route.params as { classId: string };
  const { showAlert } = useAlert();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classData, setClassData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [studentAttendanceData, setStudentAttendanceData] = useState<
    StudentAttendanceData[]
  >([]);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | null>(
    null,
  );
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<number>(Date.now());
  const [customEndDate, setCustomEndDate] = useState<number>(Date.now());

  // Date range options
  const dateRanges: DateRange[] = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);

    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    return [
      {
        label: "Today",
        startDate: today.getTime(),
        endDate: today.getTime(),
      },
      {
        label: "Yesterday",
        startDate: yesterday.getTime(),
        endDate: yesterday.getTime(),
      },
      {
        label: "Last 7 Days",
        startDate: last7Days.getTime(),
        endDate: today.getTime(),
      },
      {
        label: "Last 30 Days",
        startDate: last30Days.getTime(),
        endDate: today.getTime(),
      },
      {
        label: "Last Month",
        startDate: lastMonth.getTime(),
        endDate: lastMonthEnd.getTime(),
      },
    ];
  }, []);

  // Load initial data
  useEffect(() => {
    if (classId) {
      loadData();
    }
  }, [classId]);

  // Load data when date range changes
  useEffect(() => {
    if (selectedDateRange) {
      loadAttendanceData();
    }
  }, [selectedDateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load class data
      const classInfo = await DatabaseService.getClassById(classId);
      setClassData(classInfo);

      // Load students
      const classStudents = await DatabaseService.getClassStudents(classId);
      setStudents(classStudents);

      // Set default date range to last 7 days
      setSelectedDateRange(dateRanges[2]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load data";
      setError(errorMessage);
      showAlert({
        title: "Error",
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceData = async () => {
    if (!selectedDateRange) return;

    try {
      setLoading(true);

      const { startDate, endDate } = selectedDateRange;

      // Get attendance data for the date range
      const attendanceRecords =
        await DatabaseService.getStudentAttendanceByDateRange(
          classId,
          startDate,
          endDate,
        );
      // Process attendance data by date
      const attendanceByDate = new Map<string, AttendanceData>();

      // Initialize dates in range
      const currentDate = new Date(startDate);
      const endDateObj = new Date(endDate);

      while (currentDate <= endDateObj) {
        const dateKey = currentDate.toISOString().split("T")[0];
        attendanceByDate.set(dateKey, {
          date: dateKey,
          present: 0,
          absent: 0,
          total: students.length,
          attendanceRate: 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Count attendance by date
      attendanceRecords.forEach(record => {
        // Convert record.date (timestamp) to date string for comparison
        const recordDate = new Date(record.date);
        const dateKey = recordDate.toISOString().split("T")[0];
        const dateData = attendanceByDate.get(dateKey);
        if (dateData) {
          if (record.status === AttendanceStatus.PRESENT) {
            dateData.present++;
          } else if (record.status === AttendanceStatus.ABSENT) {
            dateData.absent++;
          }
          dateData.attendanceRate = (dateData.present / dateData.total) * 100;
        }
      });

      setAttendanceData(Array.from(attendanceByDate.values()));

      // Process student attendance data
      const studentAttendanceMap = new Map<string, StudentAttendanceData>();

      students.forEach(student => {
        studentAttendanceMap.set(student.id, {
          studentId: student.studentId,
          studentName: `${student.firstName} ${student.lastName}`,
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          attendanceRate: 0,
        });
      });

      attendanceRecords.forEach(record => {
        const studentData = studentAttendanceMap.get(record.studentId);
        if (studentData) {
          studentData.totalDays++;
          if (record.status === AttendanceStatus.PRESENT) {
            studentData.presentDays++;
          } else if (record.status === AttendanceStatus.ABSENT) {
            studentData.absentDays++;
          }
        }
      });

      // Calculate attendance rates
      studentAttendanceMap.forEach(studentData => {
        if (studentData.totalDays > 0) {
          studentData.attendanceRate =
            (studentData.presentDays / studentData.totalDays) * 100;
        }
      });

      setStudentAttendanceData(Array.from(studentAttendanceMap.values()));
    } catch (err) {
      console.error("Error loading attendance data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDateRange = () => {
    if (!customStartDate || !customEndDate) {
      showAlert({
        title: "Error",
        message: "Please select both start and end dates",
        type: "error",
      });
      return;
    }

    if (new Date(customStartDate) > new Date(customEndDate)) {
      showAlert({
        title: "Error",
        message: "Start date cannot be after end date",
        type: "error",
      });
      return;
    }

    const customRange: DateRange = {
      label: "Custom Range",
      startDate: customStartDate,
      endDate: customEndDate,
    };

    setSelectedDateRange(customRange);
    setShowCustomDatePicker(false);
  };

  const getOverallStats = () => {
    if (attendanceData.length === 0)
      return { totalPresent: 0, totalAbsent: 0, averageRate: 0 };

    const totalPresent = attendanceData.reduce(
      (sum, day) => sum + day.present,
      0,
    );
    const totalAbsent = attendanceData.reduce(
      (sum, day) => sum + day.absent,
      0,
    );
    const averageRate =
      attendanceData.reduce((sum, day) => sum + day.attendanceRate, 0) /
      attendanceData.length;

    return {
      totalPresent,
      totalAbsent,
      averageRate: Math.round(averageRate * 10) / 10,
    };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const overallStats = getOverallStats();

  if (loading && !classData) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading reports...
        </Text>
      </View>
    );
  }

  if (error || !classData) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: colors.text }]}>
          {error || "Failed to load class data"}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={loadData}
        >
          <Text style={[styles.retryButtonText, { color: colors.onPrimary }]}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <Appbar
          title="Attendance Reports"
          subtitle={classData?.name || "Class Reports"}
        />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Date Range Selector */}
          <View
            style={[
              styles.dateRangeSection,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.dateRangeHeader}>
              <Calendar size={20} color={colors.text} />
              <Text style={[styles.dateRangeTitle, { color: colors.text }]}>
                Date Range
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.dateRangeScroll}
            >
              {dateRanges.map((range, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateRangeButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                    selectedDateRange?.label === range.label && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setSelectedDateRange(range)}
                >
                  <Text
                    style={[
                      styles.dateRangeButtonText,
                      { color: colors.text },
                      selectedDateRange?.label === range.label && {
                        color: colors.onPrimary,
                      },
                    ]}
                  >
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[
                  styles.dateRangeButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                  selectedDateRange?.label === "Custom Range" && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setShowCustomDatePicker(true)}
              >
                <Text
                  style={[
                    styles.dateRangeButtonText,
                    { color: colors.text },
                    selectedDateRange?.label === "Custom Range" && {
                      color: colors.onPrimary,
                    },
                  ]}
                >
                  Custom
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {selectedDateRange && (
              <Text
                style={[styles.dateRangeInfo, { color: colors.textSecondary }]}
              >
                {format(selectedDateRange.startDate, "MMM d, yyyy")} to{" "}
                {format(selectedDateRange.endDate, "MMM d, yyyy")}
              </Text>
            )}
          </View>

          {/* Overall Statistics */}
          <View
            style={[
              styles.statsCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.statsTitle, { color: colors.text }]}>
              Overall Statistics
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <CheckCircle size={24} color={colors.success} />
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {overallStats.totalPresent}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Total Present
                </Text>
              </View>
              <View style={styles.statItem}>
                <XCircle size={24} color={colors.error} />
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {overallStats.totalAbsent}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Total Absent
                </Text>
              </View>
              <View style={styles.statItem}>
                <TrendingUp size={24} color={colors.primary} />
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {overallStats.averageRate}%
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Average Rate
                </Text>
              </View>
            </View>
          </View>

          {/* Daily Attendance Chart */}
          <View
            style={[
              styles.chartCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              Daily Attendance Trend
            </Text>
            <ScrollView
              style={styles.chartContainer}
              showsVerticalScrollIndicator={false}
            >
              {attendanceData.length > 0 ? (
                <View style={styles.barChart}>
                  {attendanceData.map(day => (
                    <View key={day.date} style={styles.barContainer}>
                      <View style={styles.barLabels}>
                        <Text style={[styles.barDate, { color: colors.text }]}>
                          {formatDate(day.date)}
                        </Text>
                        <Text
                          style={[
                            styles.barRate,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {Math.round(day.attendanceRate)}%
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.barTrack,
                          { backgroundColor: colors.border },
                        ]}
                      >
                        <View
                          style={[
                            styles.barFill,
                            {
                              width: `${day.attendanceRate}%`,
                              backgroundColor:
                                day.attendanceRate >= 80
                                  ? colors.success
                                  : day.attendanceRate >= 60
                                  ? colors.warning
                                  : colors.error,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.noDataContainer}>
                  <BarChart3 size={48} color={colors.textSecondary} />
                  <Text
                    style={[styles.noDataText, { color: colors.textSecondary }]}
                  >
                    No attendance data for selected period
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Student Performance */}
          <View
            style={[
              styles.studentsCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.studentsTitle, { color: colors.text }]}>
              Student Performance
            </Text>
            <ScrollView
              style={styles.studentsList}
              showsVerticalScrollIndicator={false}
            >
              {studentAttendanceData
                .sort((a, b) => b.attendanceRate - a.attendanceRate)
                .map(student => (
                  <View
                    key={student.studentId}
                    style={[
                      styles.studentRow,
                      {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.studentInfo}>
                      <Text
                        style={[styles.studentName, { color: colors.text }]}
                      >
                        {student.studentName}
                      </Text>
                      <Text
                        style={[
                          styles.studentStats,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {student.presentDays} present, {student.absentDays}{" "}
                        absent
                      </Text>
                    </View>
                    <View style={styles.studentRate}>
                      <Text
                        style={[
                          styles.rateText,
                          {
                            color:
                              student.attendanceRate >= 80
                                ? colors.success
                                : student.attendanceRate >= 60
                                ? colors.warning
                                : colors.error,
                          },
                        ]}
                      >
                        {Math.round(student.attendanceRate)}%
                      </Text>
                    </View>
                  </View>
                ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Custom Date Range Modal */}
        <Modal
          visible={showCustomDatePicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCustomDatePicker(false)}
        >
          <View
            style={[styles.modalOverlay, { backgroundColor: colors.backdrop }]}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.surfaceElevated },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Select Custom Date Range
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCustomDatePicker(false)}
                  style={styles.closeButton}
                >
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.dateInputContainer}>
                <Text
                  style={[
                    styles.dateInputLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Start Date
                </Text>
                <TextInput
                  style={[
                    styles.dateInput,
                    {
                      borderColor: colors.border,
                      color: colors.text,
                      backgroundColor: colors.surface,
                    },
                  ]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textTertiary}
                  value={customStartDate.toString()}
                  onChangeText={text => setCustomStartDate(Number(text))}
                />
              </View>

              <View style={styles.dateInputContainer}>
                <Text
                  style={[
                    styles.dateInputLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  End Date
                </Text>
                <TextInput
                  style={[
                    styles.dateInput,
                    {
                      borderColor: colors.border,
                      color: colors.text,
                      backgroundColor: colors.surface,
                    },
                  ]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textTertiary}
                  value={customEndDate.toString()}
                  onChangeText={text => setCustomEndDate(Number(text))}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    {
                      backgroundColor: colors.surfaceVariant,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setShowCustomDatePicker(false)}
                >
                  <Text
                    style={[styles.cancelButtonText, { color: colors.text }]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleCustomDateRange}
                >
                  <Text
                    style={[
                      styles.applyButtonText,
                      { color: colors.onPrimary },
                    ]}
                  >
                    Apply
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontWeight: "500",
  },
  dateRangeSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  dateRangeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  dateRangeTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  dateRangeScroll: {
    marginBottom: 8,
  },
  dateRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  dateRangeButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dateRangeInfo: {
    fontSize: 12,
    textAlign: "center",
  },
  statsCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
  },
  chartCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  chartContainer: {
    maxHeight: 200,
  },
  barChart: {
    gap: 12,
  },
  barContainer: {
    gap: 4,
  },
  barLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barDate: {
    fontSize: 12,
  },
  barRate: {
    fontSize: 12,
    fontWeight: "500",
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  studentsCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  studentsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  studentsList: {
    display: "flex",
    flexDirection: "column",
    maxHeight: 240,
    overflow: "scroll",
  },
  studentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: "600",
  },
  studentStats: {
    fontSize: 12,
    marginTop: 2,
  },
  studentRate: {
    alignItems: "flex-end",
  },
  rateText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  dateInputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  dateInputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontWeight: "500",
  },
  applyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  applyButtonText: {
    fontWeight: "500",
  },
});
