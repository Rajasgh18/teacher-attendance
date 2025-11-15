import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  Users,
  XCircle,
  Calendar,
  HelpCircle,
  TrendingUp,
  CheckCircle,
  ArrowLeftRight,
} from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import ClassesService from "@/services/classes";
import { ClassWithDetails, Student } from "@/types";
import AttendanceService from "@/services/attendance";
import { AttendanceStatus } from "@/types/attendance";
import { Appbar } from "@/components/appbar";
import { DatabaseService } from "@/services/databaseService";
import { useUserStore } from "@/stores/userStore";
import { useAlert } from "@/contexts/AlertContext";
import { useTheme } from "@/contexts/ThemeContext";

// Extended student interface with attendance info
interface StudentWithAttendance extends Student {
  attendanceStatus: AttendanceStatus;
  attendanceTaken: boolean;
}

export default function AttendancePage() {
  const route = useRoute();
  const navigation = useNavigation();
  const { showAlert } = useAlert();
  const { colors } = useTheme();
  const { classId } = route.params as { classId: string };
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for class data
  const { user } = useUserStore();
  const [classData, setClassData] = useState<ClassWithDetails | null>(null);
  const [classLoading, setClassLoading] = useState(true);
  const [classError, setClassError] = useState<string | null>(null);

  // State for students with attendance
  const [students, setStudents] = useState<StudentWithAttendance[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

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

  // Initialize students with today's attendance status when class data loads
  useEffect(() => {
    const initializeStudentsWithAttendance = async () => {
      if (classData?.students) {
        setStudentsLoading(true);
        try {
          // Fetch today's attendance for this class
          const todayAttendance =
            await DatabaseService.getTodayAttendanceForClass(classId);
          const studentsWithAttendance: StudentWithAttendance[] =
            classData.students.map(student => {
              // Find today's attendance for this student
              const studentAttendance = todayAttendance.find(
                attendance => attendance.studentId === student.studentId,
              );

              return {
                ...student,
                attendanceStatus: studentAttendance
                  ? (studentAttendance.status as AttendanceStatus)
                  : AttendanceStatus.PRESENT, // Default to present if no attendance taken
                attendanceTaken: !!studentAttendance,
              };
            });

          setStudents(studentsWithAttendance);
        } catch (error) {
          console.error("Error fetching today's attendance:", error);
          // Fallback: initialize with default values
          const studentsWithAttendance: StudentWithAttendance[] =
            classData.students.map(student => ({
              ...student,
              attendanceStatus: AttendanceStatus.PRESENT,
              attendanceTaken: false,
            }));
          setStudents(studentsWithAttendance);
        } finally {
          setStudentsLoading(false);
        }
      }
    };

    if (classData?.students) {
      initializeStudentsWithAttendance();
    }
  }, [classData, classId]);

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
        return HelpCircle;
    }
  };

  const getStatusText = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return "Present";
      case AttendanceStatus.ABSENT:
        return "Absent";
      default:
        return "Unknown";
    }
  };

  const toggleStatus = (studentId: string) => {
    setStudents(prevStudents =>
      prevStudents.map(student => {
        if (student.studentId === studentId) {
          const statusOrder = [
            AttendanceStatus.PRESENT,
            AttendanceStatus.ABSENT,
          ];
          const currentIndex = statusOrder.indexOf(student.attendanceStatus);
          const nextIndex = (currentIndex + 1) % statusOrder.length;
          return {
            ...student,
            attendanceStatus: statusOrder[nextIndex],
            attendanceTaken: false, // Mark as not taken since we're changing it
          };
        }
        return student;
      }),
    );
  };

  const getAttendanceStats = () => {
    const present = students.filter(
      s => s.attendanceStatus === AttendanceStatus.PRESENT,
    ).length;
    const absent = students.filter(
      s => s.attendanceStatus === AttendanceStatus.ABSENT,
    ).length;
    const total = students.length;
    const attendanceRate =
      total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";
    const attendanceTaken = students.filter(s => s.attendanceTaken).length;

    return { present, absent, total, attendanceRate, attendanceTaken };
  };

  const handleSubmit = async () => {
    if (!classData) return;

    setIsSubmitting(true);

    if (!user) {
      showAlert({
        title: "Error",
        message: "User not found",
        type: "error",
      });
      return;
    }

    try {
      const today = Date.now();

      // Create or update attendance records for all students
      const attendanceData = students.map(student => ({
        studentId: student.studentId,
        classId,
        date: today,
        status: student.attendanceStatus,
        notes: "",
        markedBy: user.id, // This should come from auth context
      }));

      await AttendanceService.bulkCreateOrUpdateStudentAttendance(
        attendanceData,
      );

      // Update students to mark attendance as taken
      setStudents(prevStudents =>
        prevStudents.map(student => ({
          ...student,
          attendanceTaken: true,
        })),
      );
      showAlert({
        title: "Success!",
        message: "Attendance has been recorded successfully.",
        type: "success",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit attendance";
      showAlert({
        title: "Error",
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = getAttendanceStats();

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
          <XCircle size={32} color={colors.error} />
        </View>
        <Text style={[styles.errorText, { color: colors.text }]}>
          {classError || "Class not found"}
        </Text>
        <TouchableOpacity
          style={[styles.goBackButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.goBackButtonText, { color: colors.onPrimary }]}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <Appbar
          title={classData.grade}
          subtitle="Take Attendance"
          trailing={
            <TouchableOpacity
              onPress={() =>
                showAlert({
                  title: "Date",
                  message: "Today's date: " + new Date().toLocaleDateString(),
                })
              }
            >
              <Calendar size={20} color={colors.text} />
            </TouchableOpacity>
          }
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Attendance Stats */}
          <View
            style={[
              styles.statsCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.statsTitle, { color: colors.text }]}>
              Today's Attendance
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: colors.successContainer },
                  ]}
                >
                  <CheckCircle size={20} color={colors.success} />
                </View>
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {stats.present}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Present
                </Text>
              </View>

              <View style={styles.statItem}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: colors.errorContainer },
                  ]}
                >
                  <XCircle size={20} color={colors.error} />
                </View>
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {stats.absent}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Absent
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.attendanceRateContainer,
                { borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.attendanceRateIconContainer,
                  { backgroundColor: colors.primaryContainer },
                ]}
              >
                <TrendingUp size={24} color={colors.primary} />
              </View>
              <Text style={[styles.attendanceRate, { color: colors.text }]}>
                {stats.attendanceRate}%
              </Text>
              <Text
                style={[
                  styles.attendanceRateLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Attendance Rate
              </Text>
            </View>

            {/* Attendance Status Indicator */}
            <View
              style={[
                styles.attendanceStatusContainer,
                { borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.attendanceStatusText,
                  { color: colors.textSecondary },
                ]}
              >
                {stats.attendanceTaken === stats.total
                  ? "✅ Attendance completed for today"
                  : stats.attendanceTaken > 0
                  ? `⚠️ Partial attendance taken (${stats.attendanceTaken}/${stats.total})`
                  : "⏰ Attendance not taken yet"}
              </Text>
            </View>
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
                {stats.total} students
              </Text>
            </View>

            {studentsLoading && (
              <View style={styles.loadingStudentsContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text
                  style={[
                    styles.loadingStudentsText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Loading students...
                </Text>
              </View>
            )}

            <View style={styles.studentsList}>
              {students.map(student => {
                const StatusIcon = getStatusIcon(student.attendanceStatus);
                return (
                  <TouchableOpacity
                    key={student.id}
                    style={[
                      styles.studentCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                      student.attendanceTaken &&
                        styles.studentCardAttendanceTaken,
                    ]}
                    onPress={() => toggleStatus(student.studentId)}
                  >
                    <View style={styles.studentInfo}>
                      <Text
                        style={[styles.studentName, { color: colors.text }]}
                      >
                        {student.firstName} {student.lastName}
                      </Text>
                      <Text
                        style={[
                          styles.studentId,
                          { color: colors.textSecondary },
                        ]}
                      >
                        ID: {student.studentId}
                      </Text>
                      {student.attendanceTaken && (
                        <Text
                          style={[
                            styles.attendanceTakenText,
                            { color: colors.success },
                          ]}
                        >
                          ✅ Attendance recorded
                        </Text>
                      )}
                    </View>
                    <View style={styles.studentStatus}>
                      <View style={styles.statusInfo}>
                        <StatusIcon
                          size={24}
                          color={getStatusColor(student.attendanceStatus)}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(student.attendanceStatus) },
                          ]}
                        >
                          {getStatusText(student.attendanceStatus)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.toggleButton,
                          { borderColor: colors.border },
                        ]}
                        onPress={() => toggleStatus(student.studentId)}
                      >
                        <ArrowLeftRight
                          size={16}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {students.length === 0 && !studentsLoading && (
              <View style={styles.emptyStudentsContainer}>
                <Users size={48} color={colors.textSecondary} />
                <Text
                  style={[
                    styles.emptyStudentsText,
                    { color: colors.textSecondary },
                  ]}
                >
                  No students in this class
                </Text>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <View style={styles.submitSection}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: colors.primary },
                isSubmitting && { backgroundColor: colors.disabled },
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting || students.length === 0}
            >
              {isSubmitting ? (
                <Text
                  style={[styles.submitButtonText, { color: colors.onPrimary }]}
                >
                  Saving...
                </Text>
              ) : (
                <>
                  <CheckCircle size={24} color={colors.onPrimary} />
                  <Text
                    style={[
                      styles.submitButtonText,
                      { color: colors.onPrimary },
                    ]}
                  >
                    {stats.attendanceTaken > 0
                      ? "Update Attendance"
                      : "Save Attendance"}
                  </Text>
                </>
              )}
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
  goBackButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  goBackButtonText: {
    fontWeight: "500",
  },
  statsCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
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
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
  },
  attendanceRateContainer: {
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  attendanceRateIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  attendanceRate: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  attendanceRateLabel: {
    fontSize: 14,
  },
  attendanceStatusContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    alignItems: "center",
  },
  attendanceStatusText: {
    fontSize: 14,
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
    alignItems: "center",
  },
  studentCardAttendanceTaken: {
    opacity: 0.7, // Indicate that attendance is already taken
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  studentId: {
    fontSize: 14,
  },
  attendanceTakenText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  studentStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  toggleButton: {
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
  submitSection: {
    marginBottom: 20,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
