import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  User,
  Plus,
  Book,
  Users,
  School,
  BookOpen,
  Calendar,
  BarChart3,
} from "lucide-react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { Appbar } from "@/components/appbar";
import { ConnectivityBanner } from "@/components/ConnectivityBanner";
import { useNavigation } from "@/navigation";
import { useUserStore } from "@/stores/userStore";
import { useAlert } from "@/contexts/AlertContext";
import { useTheme } from "@/contexts/ThemeContext";
import DashboardService from "@/services/dashboard";
import { ClassSummary, ClassWithDetails } from "@/types";

// Interface for class summary from dashboard service

export default function Home() {
  const { user } = useUserStore();
  const { showAlert } = useAlert();
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [classSummaries, setClassSummaries] = useState<ClassSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      if (user.role === "teacher") {
        // Load teacher-specific data
        const teacherDashboard = await DashboardService.getTeacherDashboard(
          user.id,
        );
        setClasses(teacherDashboard.classes);
        const allClassSummaries = await DashboardService.getAllClassSummaries();
        setClassSummaries(allClassSummaries);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load dashboard";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  if (!user) {
    navigation.navigate("Login");
    return <></>;
  }

  if (error) {
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
          <ActivityIndicator size="large" color={colors.error} />
        </View>
        <Text style={[styles.errorTitle, { color: colors.text }]}>
          Something went wrong
        </Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={loadDashboardData}
        >
          <Text style={[styles.retryButtonText, { color: colors.onPrimary }]}>
            Try Again
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={[styles.retryButtonText, { color: colors.onPrimary }]}>
            Go to Login
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <Appbar
          showBack={false}
          title={`Welcome, ${user.firstName}!`}
          trailing={
            <TouchableOpacity
              style={[
                styles.profileButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => navigation.navigate("Profile")}
            >
              <User size={24} color={colors.text} />
            </TouchableOpacity>
          }
        />
        <ConnectivityBanner />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            {user.role === "teacher" ? (
              // Teacher-specific stats
              <>
                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <BookOpen size={24} color={colors.primary} />
                  <Text style={[styles.statNumber, { color: colors.text }]}>
                    {classes.length}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Assigned Classes
                  </Text>
                </View>
                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Users size={24} color={colors.primary} />
                  <Text style={[styles.statNumber, { color: colors.text }]}>
                    {classes.reduce(
                      (total, cls) => total + (cls.students?.length || 0),
                      0,
                    )}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Total Students
                  </Text>
                </View>
                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Calendar size={24} color={colors.primary} />
                  <Text style={[styles.statNumber, { color: colors.text }]}>
                    {new Date().getDate()}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Today's Date
                  </Text>
                </View>
              </>
            ) : (
              // Admin/Principal stats
              <>
                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <School size={24} color={colors.primary} />
                  <Text style={[styles.statNumber, { color: colors.text }]}>
                    {classSummaries.length}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Total Classes
                  </Text>
                </View>
                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Users size={24} color={colors.primary} />
                  <Text style={[styles.statNumber, { color: colors.text }]}>
                    {classSummaries.reduce(
                      (total, cls) => total + cls.studentCount,
                      0,
                    )}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Total Students
                  </Text>
                </View>
                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <BookOpen size={24} color={colors.primary} />
                  <Text style={[styles.statNumber, { color: colors.text }]}>
                    {classSummaries.reduce(
                      (total, cls) => total + cls.presentToday,
                      0,
                    )}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Present Today
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Classes Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {user.role === "teacher" ? "Your Classes" : "All Classes"}
              </Text>
              {user.role !== "teacher" && (
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    {
                      backgroundColor: colors.surfaceVariant,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() =>
                    showAlert({
                      title: "Add Class",
                      message: "Add class not implemented yet",
                      type: "info",
                    })
                  }
                >
                  <Plus size={20} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>

            {user.role === "teacher" ? (
              // Show classes for teacher
              classes.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Book size={48} color={colors.textSecondary} />
                  <Text
                    style={[styles.emptyText, { color: colors.textSecondary }]}
                  >
                    No classes assigned yet. Contact your administrator.
                  </Text>
                </View>
              ) : (
                <View style={styles.classesList}>
                  {classes.map(cls => {
                    const studentCount = cls.students?.length || 0;

                    return (
                      <TouchableOpacity
                        key={cls.id}
                        style={[
                          styles.classCard,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() =>
                          navigation.navigate("ClassDetails", {
                            classId: cls.classId,
                          })
                        }
                      >
                        <View
                          style={[
                            styles.classIcon,
                            {
                              backgroundColor: colors.primary + "20",
                              borderWidth: 1,
                              borderColor: colors.primary + "50",
                            },
                          ]}
                        >
                          <Book size={24} color={colors.primary} />
                        </View>
                        <View style={styles.classInfo}>
                          <Text
                            style={[styles.className, { color: colors.text }]}
                          >
                            {cls.name}
                          </Text>
                          <Text
                            style={[
                              styles.classDetails,
                              { color: colors.textSecondary },
                            ]}
                          >
                            Grade {cls.grade} - {cls.section}
                          </Text>
                          <Text
                            style={[
                              styles.academicYear,
                              { color: colors.textSecondary },
                            ]}
                          >
                            Academic Year: {cls.academicYear}
                          </Text>
                          <View style={styles.classFooter}>
                            <View style={styles.studentCount}>
                              <Users size={16} color={colors.textSecondary} />
                              <Text
                                style={[
                                  styles.studentCountText,
                                  { color: colors.textSecondary },
                                ]}
                              >
                                {studentCount} students
                              </Text>
                            </View>
                            <TouchableOpacity
                              style={[
                                styles.viewButton,
                                { backgroundColor: colors.primary },
                              ]}
                              onPress={() =>
                                navigation.navigate("TakeAttendance", {
                                  classId: cls.classId,
                                })
                              }
                            >
                              <Text
                                style={[
                                  styles.viewButtonText,
                                  { color: colors.onPrimary },
                                ]}
                              >
                                Take Attendance
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )
            ) : // Show classes for admin/principal
            classSummaries.length === 0 ? (
              <View style={styles.emptyContainer}>
                <School size={48} color={colors.textSecondary} />
                <Text
                  style={[styles.emptyText, { color: colors.textSecondary }]}
                >
                  No classes found. Create your first class to get started.
                </Text>
              </View>
            ) : (
              <View style={styles.classesList}>
                {classSummaries.map(classItem => {
                  const classDetails = classes.find(
                    cls => cls.id === classItem.id,
                  );

                  return (
                    <TouchableOpacity
                      key={classItem.id}
                      style={styles.classCard}
                      onPress={() =>
                        navigation.navigate("ClassDetails", {
                          classId: classItem.id,
                        })
                      }
                    >
                      <View
                        style={[
                          styles.classIcon,
                          { backgroundColor: colors.primary + "20" },
                        ]}
                      >
                        <Book size={24} color={colors.primary} />
                      </View>
                      <View style={styles.classInfo}>
                        <Text style={styles.className}>{classItem.name}</Text>
                        <Text style={styles.classDetails}>
                          Grade {classDetails?.grade} - {classDetails?.section}
                        </Text>
                        <Text style={styles.academicYear}>
                          Academic Year: {classDetails?.academicYear}
                        </Text>
                        <View style={styles.classFooter}>
                          <View style={styles.studentCount}>
                            <Users size={16} color="#6b7280" />
                            <Text style={styles.studentCountText}>
                              {classItem.studentCount} students
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={[
                              styles.viewButton,
                              { backgroundColor: colors.primary },
                            ]}
                            onPress={() =>
                              navigation.navigate("ClassDetails", {
                                classId: classItem.id,
                              })
                            }
                          >
                            <Text
                              style={[
                                styles.viewButtonText,
                                { color: colors.onPrimary },
                              ]}
                            >
                              View Details
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quick Actions
            </Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[
                  styles.quickActionCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => navigation.navigate("Attendance")}
              >
                <Calendar size={24} color={colors.primary} />
                <Text style={[styles.quickActionText, { color: colors.text }]}>
                  My Attendance
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.quickActionCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => navigation.navigate("Marks")}
              >
                <BarChart3 size={24} color={colors.primary} />
                <Text style={[styles.quickActionText, { color: colors.text }]}>
                  Student Marks
                </Text>
              </TouchableOpacity>
            </View>
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
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
  },
  classesList: {
    gap: 16,
  },
  classCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
    alignItems: "center",
  },
  classIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  classDetails: {
    fontSize: 14,
    marginBottom: 4,
  },
  academicYear: {
    fontSize: 12,
    marginBottom: 12,
  },
  classFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  studentCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  studentCountText: {
    fontSize: 12,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
