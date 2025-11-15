import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  Edit,
  Users,
  Clock,
  Search,
  XCircle,
  BarChart3,
  AlertCircle,
  CheckCircle,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import React, { useState, useMemo, useCallback, useEffect } from "react";

import { useNavigation } from "@/navigation";
import { Appbar } from "@/components/appbar";
import ClassesService from "@/services/classes";
import { useAlert } from "@/contexts/AlertContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ClassWithDetails, Student } from "@/types";
import { AttendanceStatus } from "@/types/attendance";
import { DatabaseService } from "@/services/databaseService";

// Extended student interface with attendance info
interface StudentWithAttendance extends Student {
  attendance?: {
    status: AttendanceStatus;
    lastPresent?: string;
    attendancePercentage: number;
    attendanceTaken: boolean;
  };
}

export default function ClassDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { showAlert } = useAlert();
  const { colors } = useTheme();
  const { classId } = route.params as { classId: string };
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "present" | "absent" | "not-taken"
  >("all");

  // State for class data
  const [classData, setClassData] = useState<ClassWithDetails | null>(null);
  const [classLoading, setClassLoading] = useState(true);
  const [classError, setClassError] = useState<string | null>(null);

  // State for attendance data
  const [todayAttendance, setTodayAttendance] = useState<any[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Fetch class details
  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setClassLoading(true);
        setClassError(null);
        const data = await ClassesService.getClassWithDetails(classId);
        setClassData(data);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load class details";
        setClassError(errorMessage);
        showAlert({
          title: "Error",
          message: errorMessage,
          type: "error",
        });
      } finally {
        setClassLoading(false);
      }
    };

    if (classId) {
      fetchClassData();
    }
  }, [classId]);

  // Fetch attendance data when class data is loaded
  const fetchAttendanceData = useCallback(async () => {
    if (!classData) return;

    try {
      setAttendanceLoading(true);
      const data = await DatabaseService.getTodayAttendanceForClass(classId);
      setTodayAttendance(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load attendance";
      console.warn("Failed to load today's attendance:", errorMessage);
    } finally {
      setAttendanceLoading(false);
    }
  }, [classData, classId]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  // Refresh attendance data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Only refresh attendance data, not class data
      if (classData) {
        fetchAttendanceData();
      }
    }, [fetchAttendanceData, classData]),
  );

  // Refresh functions
  const refreshClass = useCallback(async () => {
    try {
      setClassLoading(true);
      setClassError(null);
      const data = await ClassesService.getClassWithDetails(classId);
      setClassData(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load class details";
      setClassError(errorMessage);
      showAlert({
        title: "Error",
        message: errorMessage,
        type: "error",
      });
    } finally {
      setClassLoading(false);
    }
  }, [classId]);

  const refreshAttendance = useCallback(async () => {
    if (!classData) return;

    try {
      setAttendanceLoading(true);
      const data = await DatabaseService.getTodayAttendanceForClass(classId);
      setTodayAttendance(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load attendance";
      console.warn("Failed to load today's attendance:", errorMessage);
    } finally {
      setAttendanceLoading(false);
    }
  }, [classData, classId]);

  // Combined refresh function for pull-to-refresh
  const handleRefresh = useCallback(async () => {
    await Promise.all([refreshClass(), refreshAttendance()]);
  }, [refreshClass, refreshAttendance]);

  // Combine class data with attendance information
  const studentsWithAttendance = useMemo(() => {
    if (!classData?.students) return [];

    return classData.students.map(student => {
      // Find today's attendance for this student
      const todayRecord = todayAttendance?.find(
        att => att.studentId === student.studentId,
      );

      // Calculate attendance percentage (mock calculation for now)
      // In a real app, you'd fetch attendance history and calculate this
      const attendancePercentage =
        todayRecord?.status === AttendanceStatus.PRESENT ? 95 : 85;

      return {
        ...student,
        attendance: {
          status: todayRecord?.status || AttendanceStatus.ABSENT,
          lastPresent:
            todayRecord?.status === AttendanceStatus.PRESENT
              ? new Date().toISOString().split("T")[0]
              : new Date(Date.now() - 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0],
          attendancePercentage,
          attendanceTaken: !!todayRecord,
        },
      } as StudentWithAttendance;
    });
  }, [classData?.students, todayAttendance]);

  // Filter students based on search and status
  const filteredStudents = useMemo(() => {
    return studentsWithAttendance.filter(student => {
      const matchesSearch =
        student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.includes(searchQuery);

      let matchesFilter = true;
      if (filterStatus === "present") {
        matchesFilter = student.attendance?.status === AttendanceStatus.PRESENT;
      } else if (filterStatus === "absent") {
        matchesFilter = student.attendance?.status === AttendanceStatus.ABSENT;
      } else if (filterStatus === "not-taken") {
        matchesFilter = !student.attendance?.attendanceTaken;
      }

      return matchesSearch && matchesFilter;
    });
  }, [studentsWithAttendance, searchQuery, filterStatus]);

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return colors.success;
      case AttendanceStatus.ABSENT:
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return CheckCircle;
      case AttendanceStatus.ABSENT:
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusText = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return "Present";
      case AttendanceStatus.ABSENT:
        return "Absent";
      default:
        return "Not Taken";
    }
  };

  // Calculate attendance stats
  const attendanceStats = useMemo(() => {
    const total = studentsWithAttendance.length;
    const present = studentsWithAttendance.filter(
      s => s.attendance?.status === AttendanceStatus.PRESENT,
    ).length;
    const absent = studentsWithAttendance.filter(
      s => s.attendance?.status === AttendanceStatus.ABSENT,
    ).length;
    const notTaken = studentsWithAttendance.filter(
      s => !s.attendance?.attendanceTaken,
    ).length;
    const attendanceRate =
      total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";

    return { total, present, absent, notTaken, attendanceRate };
  }, [studentsWithAttendance]);

  // Loading state
  if (classLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading class details...
        </Text>
      </View>
    );
  }

  // Error state
  if (classError || !classData) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: colors.background }]}
      >
        <View
          style={[
            styles.errorIconContainer,
            { backgroundColor: colors.errorContainer },
          ]}
        >
          <AlertCircle size={32} color={colors.error} />
        </View>
        <Text style={[styles.errorText, { color: colors.text }]}>
          {classError || "Class not found"}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={refreshClass}
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
        {/* Header */}
        <Appbar
          title={classData.grade}
          subtitle={`Section ${classData.section}`}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={classLoading || attendanceLoading}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {/* Today's Attendance Summary */}
          <View
            style={[
              styles.attendanceSummaryCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text
              style={[styles.attendanceSummaryTitle, { color: colors.text }]}
            >
              Today's Attendance
            </Text>
            <View style={styles.attendanceSummaryGrid}>
              <View style={styles.attendanceSummaryItem}>
                <CheckCircle size={20} color={colors.success} />
                <Text
                  style={[
                    styles.attendanceSummaryNumber,
                    { color: colors.text },
                  ]}
                >
                  {attendanceStats.present}
                </Text>
                <Text
                  style={[
                    styles.attendanceSummaryLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Present
                </Text>
              </View>
              <View style={styles.attendanceSummaryItem}>
                <XCircle size={20} color={colors.error} />
                <Text
                  style={[
                    styles.attendanceSummaryNumber,
                    { color: colors.text },
                  ]}
                >
                  {attendanceStats.absent}
                </Text>
                <Text
                  style={[
                    styles.attendanceSummaryLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Absent
                </Text>
              </View>
              <View style={styles.attendanceSummaryItem}>
                <Clock size={20} color={colors.textSecondary} />
                <Text
                  style={[
                    styles.attendanceSummaryNumber,
                    { color: colors.text },
                  ]}
                >
                  {attendanceStats.notTaken}
                </Text>
                <Text
                  style={[
                    styles.attendanceSummaryLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Not Taken
                </Text>
              </View>
            </View>
            <View style={styles.attendanceRateContainer}>
              <Text style={[styles.attendanceRateText, { color: colors.text }]}>
                {attendanceStats.attendanceRate}% Attendance Rate
              </Text>
            </View>
          </View>

          {/* Search and Filter */}
          <View style={styles.searchSection}>
            <View
              style={[styles.searchContainer, { borderColor: colors.border }]}
            >
              <Search
                size={18}
                color={colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search students..."
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={styles.filterContainer}
            >
              {(["all", "present", "absent", "not-taken"] as const).map(
                status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterButton,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                      filterStatus === status && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => setFilterStatus(status)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        { color: colors.text },
                        filterStatus === status && {
                          color: colors.onPrimary,
                        },
                      ]}
                    >
                      {status === "not-taken"
                        ? "Not Taken"
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </ScrollView>
          </View>

          {/* Students List */}
          <View style={styles.studentsSection}>
            <View style={styles.studentsHeader}>
              <Text style={[styles.studentsTitle, { color: colors.text }]}>
                Students
              </Text>
              <Text
                style={[styles.studentsCount, { color: colors.textSecondary }]}
              >
                {filteredStudents.length} students
              </Text>
            </View>

            {attendanceLoading && (
              <View style={styles.loadingStudentsContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text
                  style={[
                    styles.loadingStudentsText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Loading attendance...
                </Text>
              </View>
            )}

            <View style={styles.studentsList}>
              {filteredStudents.map(student => {
                const StatusIcon = getStatusIcon(
                  student.attendance?.status || AttendanceStatus.ABSENT,
                );
                return (
                  <TouchableOpacity
                    key={student.id}
                    style={[
                      styles.studentCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                      student.attendance?.attendanceTaken &&
                        styles.studentCardAttendanceTaken,
                    ]}
                    onPress={() =>
                      navigation.navigate("StudentDetails", {
                        studentId: student.studentId,
                        classId,
                      })
                    }
                  >
                    <View style={styles.studentInfo}>
                      <View style={styles.studentHeader}>
                        <Text
                          style={[styles.studentName, { color: colors.text }]}
                        >
                          {student.firstName} {student.lastName}
                        </Text>
                        {student.attendance && (
                          <View style={styles.statusContainer}>
                            <StatusIcon
                              size={16}
                              color={getStatusColor(student.attendance.status)}
                            />
                            <Text
                              style={[
                                styles.statusText,
                                {
                                  color: getStatusColor(
                                    student.attendance.status,
                                  ),
                                },
                              ]}
                            >
                              {getStatusText(student.attendance.status)}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.studentEmail,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {student.email}
                      </Text>
                      <View style={styles.studentFooter}>
                        {student.attendance && (
                          <>
                            <Text
                              style={[
                                styles.attendanceInfo,
                                { color: colors.textSecondary },
                              ]}
                            >
                              Attendance:{" "}
                              {student.attendance.attendancePercentage}%
                            </Text>
                            {student.attendance.attendanceTaken ? (
                              <View style={styles.attendanceTakenContainer}>
                                <CheckCircle size={16} color={colors.success} />
                                <Text
                                  style={[
                                    styles.attendanceTakenText,
                                    { color: colors.success },
                                  ]}
                                >
                                  Recorded
                                </Text>
                              </View>
                            ) : (
                              <View style={styles.attendanceNotTakenContainer}>
                                <Clock size={16} color={colors.textSecondary} />
                                <Text
                                  style={[
                                    styles.attendanceNotTakenText,
                                    { color: colors.textSecondary },
                                  ]}
                                >
                                  Not taken
                                </Text>
                              </View>
                            )}
                          </>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.editButton,
                        { borderColor: colors.border },
                      ]}
                      onPress={() =>
                        showAlert({
                          title: "Edit",
                          message: "Edit student not implemented yet",
                          type: "info",
                        })
                      }
                    >
                      <Edit size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>

            {filteredStudents.length === 0 && !attendanceLoading && (
              <View style={styles.emptyStudentsContainer}>
                <Users size={48} color={colors.textSecondary} />
                <Text
                  style={[
                    styles.emptyStudentsText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {searchQuery || filterStatus !== "all"
                    ? "No students match your search criteria"
                    : "No students in this class yet"}
                </Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[
                styles.takeAttendanceButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() =>
                navigation.navigate("TakeAttendance" as any, { classId } as any)
              }
            >
              <Text
                style={[styles.takeAttendanceIcon, { color: colors.onPrimary }]}
              >
                ✓
              </Text>
              <Text
                style={[styles.takeAttendanceText, { color: colors.onPrimary }]}
              >
                Take Attendance
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewReportsButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() =>
                navigation.navigate("Reports" as any, { classId } as any)
              }
            >
              <BarChart3 size={24} color={colors.text} />
              <Text style={[styles.viewReportsText, { color: colors.text }]}>
                View Reports
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  errorIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontWeight: "500",
  },
  searchSection: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  filterContainer: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  studentsSection: {
    marginBottom: 24,
  },
  studentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  studentsTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  studentsCount: {
    fontSize: 14,
  },
  loadingStudentsContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loadingStudentsText: {
    fontSize: 14,
    marginTop: 8,
  },
  studentsList: {
    gap: 12,
  },
  studentCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  studentCardAttendanceTaken: {
    opacity: 0.7,
  },
  studentInfo: {
    flex: 1,
  },
  studentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  studentEmail: {
    fontSize: 12,
    marginBottom: 8,
  },
  studentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  attendanceInfo: {
    fontSize: 12,
  },
  attendanceTakenContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  attendanceTakenText: {
    fontSize: 12,
    fontWeight: "500",
  },
  attendanceNotTakenContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  attendanceNotTakenText: {
    fontSize: 12,
    fontWeight: "500",
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStudentsContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyStudentsText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  takeAttendanceButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  takeAttendanceIcon: {
    fontSize: 18,
  },
  takeAttendanceText: {
    fontSize: 14,
    fontWeight: "500",
  },
  viewReportsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  viewReportsText: {
    fontSize: 14,
    fontWeight: "500",
  },
  attendanceSummaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  attendanceSummaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  attendanceSummaryGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  attendanceSummaryItem: {
    alignItems: "center",
  },
  attendanceSummaryNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },
  attendanceSummaryLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  attendanceRateContainer: {
    alignItems: "center",
  },
  attendanceRateText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
