import {
  View,
  Text,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  PermissionsAndroid,
  AppState,
} from "react-native";
import { useState, useEffect } from "react";
import Geolocation from "@react-native-community/geolocation";
import { SafeAreaView } from "react-native-safe-area-context";
import { Clock, CheckCircle, MapPin } from "lucide-react-native";

import { Appbar } from "@/components/appbar";
import { AttendanceService } from "@/services";
import { backgroundLocationService } from "@/services/backgroundLocationService";
import { Calendar } from "@/components/Calendar";
import { useUserStore } from "@/stores/userStore";
import { useAlert } from "@/contexts/AlertContext";
import { useTheme } from "@/contexts/ThemeContext";
import { TeacherAttendance, AttendanceStatus } from "@/types";
import { ConnectivityBanner } from "@/components/ConnectivityBanner";

export default function Attendance() {
  const { user } = useUserStore();
  const { showAlert } = useAlert();
  const { colors } = useTheme();

  const [attendance, setAttendance] = useState<TeacherAttendance | null>(null);
  const [allAttendance, setAllAttendance] = useState<TeacherAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkInTime, setCheckInTime] = useState<number | undefined>();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isLocationTracking, setIsLocationTracking] = useState(false);

  const today = Date.now();

  useEffect(() => {
    loadTodayAttendance();
    loadAllAttendance();
    requestLocationPermission();

    // Check if location tracking is already active
    setIsLocationTracking(backgroundLocationService.isLocationTrackingActive());

    // Handle app state changes to ensure location tracking continues
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active" && isLocationTracking) {
        // App came to foreground, check if tracking is still active
        setIsLocationTracking(
          backgroundLocationService.isLocationTrackingActive(),
        );
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    // Cleanup: stop location tracking when component unmounts
    return () => {
      subscription?.remove();
    };
  }, [isLocationTracking]);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message:
              "Location permission is required to mark attendance with your current location.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          showAlert({
            title: "Location Permission",
            message: "Location permission is required to mark attendance.",
            type: "warning",
          });
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Error requesting location permission:", error);
      return false;
    }
  };

  const getCurrentLocation = (): Promise<{
    latitude: number;
    longitude: number;
  } | null> => {
    return new Promise(resolve => {
      setLocationLoading(true);

      Geolocation.getCurrentPosition(
        (position: any) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(locationData);
          setLocationLoading(false);
          resolve(locationData);
        },
        (error: any) => {
          console.error("Error getting location:", error);
          showAlert({
            title: "Location Error",
            message: "Failed to get your current location.",
            type: "error",
          });
          setLocationLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  };

  const loadTodayAttendance = async () => {
    if (!user) {
      showAlert({
        title: "Error",
        message: "No user found. Please log in again.",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const todayAttendance = await AttendanceService.getTeacherAttendance(
        user.id,
        { checkIn: today },
      );

      if (todayAttendance.length > 0) {
        setAttendance(todayAttendance[0]);
        setCheckInTime(todayAttendance[0].checkIn || Date.now());
      } else {
        setAttendance(null);
        setCheckInTime(Date.now());
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
      showAlert({
        title: "Error",
        message: "Failed to load attendance data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAllAttendance = async () => {
    if (!user) return;

    try {
      const attendanceData = await AttendanceService.getTeacherAttendance(
        user.id,
      );
      setAllAttendance(attendanceData);
    } catch (error) {
      console.error("Error loading all attendance:", error);
    }
  };

  const markPresent = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Get current location
      const currentLocation = await getCurrentLocation();
      if (!currentLocation) {
        showAlert({
          title: "Error",
          message: "Unable to get your location. Please try again.",
          type: "error",
        });
        return;
      }

      const currentTime = Date.now();

      let attendanceId: string;

      if (attendance) {
        // Update existing attendance
        await AttendanceService.updateTeacherAttendance(attendance.id, {
          status: AttendanceStatus.PRESENT,
          checkIn: currentTime,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        });
        attendanceId = attendance.id;
      } else {
        // Create new attendance
        attendanceId = await AttendanceService.createTeacherAttendance({
          teacherId: user.id,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          status: AttendanceStatus.PRESENT,
          checkIn: currentTime,
        });
      }

      // Start background location tracking
      console.log("Starting background location tracking");
      backgroundLocationService.startTracking(attendanceId, user.id);
      setIsLocationTracking(true);

      setCheckInTime(currentTime);
      await loadTodayAttendance();
      await loadAllAttendance();
      showAlert({
        title: "Success",
        message:
          "Marked as present with location! Background tracking started.",
        type: "success",
      });
    } catch (error) {
      console.error("Error marking present:", error);
      showAlert({
        title: "Error",
        message: "Failed to mark attendance",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusText = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return "Present";
      case AttendanceStatus.ABSENT:
        return "Absent";
      default:
        return "Not Marked";
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "Not set";
    return new Date(timeString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string | number) => {
    const date =
      typeof dateString === "string"
        ? new Date(dateString)
        : new Date(dateString);
    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const changeMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading attendance...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Appbar title="My Attendance" />
      <ConnectivityBanner />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {user && (
          <View
            style={[
              styles.userInfo,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.userName, { color: colors.text }]}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={[styles.userRole, { color: colors.textSecondary }]}>
              {user.role}
            </Text>
            {user.department && (
              <Text
                style={[styles.userDepartment, { color: colors.textTertiary }]}
              >
                {user.department}
              </Text>
            )}
          </View>
        )}

        {/* Today's Status Card */}
        <View
          style={[
            styles.statusCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            Today's Status
          </Text>
          <View style={styles.statusContent}>
            <View style={styles.statusIndicator}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: attendance
                      ? attendance.status === AttendanceStatus.PRESENT
                        ? colors.success
                        : colors.error
                      : colors.textSecondary,
                  },
                ]}
              />
              <Text style={[styles.statusText, { color: colors.text }]}>
                {attendance ? getStatusText(attendance.status) : "Not Marked"}
              </Text>
            </View>
            {attendance && (
              <View style={styles.timeRow}>
                <Clock size={16} color={colors.textSecondary} />
                <Text
                  style={[styles.timeLabel, { color: colors.textSecondary }]}
                >
                  Check In:
                </Text>
                <Text style={[styles.timeValue, { color: colors.text }]}>
                  {checkInTime
                    ? formatTime(new Date(checkInTime).toISOString())
                    : "Not set"}
                </Text>
              </View>
            )}
            {isLocationTracking && (
              <View style={styles.timeRow}>
                <MapPin size={16} color={colors.success} />
                <Text style={[styles.timeLabel, { color: colors.success }]}>
                  Location Tracking:
                </Text>
                <Text style={[styles.timeValue, { color: colors.success }]}>
                  Active (every 5 min)
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Check In/Absent Actions */}
        <View style={styles.actionsContainer}>
          {/* Only show Check In button if not already checked in today */}
          {!attendance || attendance.status !== AttendanceStatus.PRESENT ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={markPresent}
              disabled={saving || locationLoading}
            >
              {locationLoading ? (
                <ActivityIndicator size="small" color={colors.onPrimary} />
              ) : (
                <CheckCircle size={24} color={colors.onPrimary} />
              )}
              <Text
                style={[styles.actionButtonText, { color: colors.onPrimary }]}
              >
                {saving ? "Marking..." : "Check In"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={[styles.actionButton, { backgroundColor: colors.success }]}
            >
              <CheckCircle size={24} color={colors.onPrimary} />
              <Text
                style={[styles.actionButtonText, { color: colors.onPrimary }]}
              >
                Already Checked In
              </Text>
            </View>
          )}
        </View>

        <Calendar
          currentMonth={currentMonth}
          attendanceData={allAttendance.map(att => ({
            date: att.checkIn || Date.now(),
            status: att.status,
          }))}
          onMonthChange={changeMonth}
        />

        {/* Attendance History */}
        <View
          style={[
            styles.historyCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Text style={[styles.historyTitle, { color: colors.text }]}>
            Recent Attendance
          </Text>
          <View style={[styles.hr, { borderBottomColor: colors.border }]} />
          <ScrollView style={styles.historyList}>
            {allAttendance.map((att, index) => (
              <View
                key={att.id || index}
                style={[
                  styles.historyItem,
                  {
                    borderBottomWidth:
                      index === allAttendance.length - 1 ? 0 : 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.historyDate}>
                  <Text
                    style={[styles.historyDateText, { color: colors.text }]}
                  >
                    {formatDate(att.checkIn || "")}
                  </Text>
                  <Text
                    style={[
                      styles.historyTimeText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {att.checkIn
                      ? formatTime(new Date(att.checkIn).toISOString())
                      : "Not set"}
                  </Text>
                </View>
                <View style={styles.historyStatus}>
                  <View
                    style={[
                      styles.historyStatusDot,
                      {
                        backgroundColor:
                          att.status === AttendanceStatus.PRESENT
                            ? colors.success
                            : colors.error,
                      },
                    ]}
                  />
                  <Text
                    style={[styles.historyStatusText, { color: colors.text }]}
                  >
                    {getStatusText(att.status)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Location Info */}
        {location && (
          <View
            style={[
              styles.locationCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Text style={[styles.locationTitle, { color: colors.text }]}>
              <MapPin size={16} color={colors.textSecondary} /> Current Location
            </Text>
            <Text
              style={[styles.locationText, { color: colors.textSecondary }]}
            >
              Lat: {location.latitude.toFixed(6)}
            </Text>
            <Text
              style={[styles.locationText, { color: colors.textSecondary }]}
            >
              Lng: {location.longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  hr: {
    borderBottomWidth: 1,
  },
  userInfo: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    textTransform: "capitalize",
    marginBottom: 2,
  },
  userDepartment: {
    fontSize: 14,
  },
  statusCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  statusContent: {
    alignItems: "center",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 14,
    marginLeft: 4,
    marginRight: 4,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },

  historyCard: {
    borderRadius: 12,
    marginTop: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "600",
    padding: 12,
  },
  historyList: {
    maxHeight: 300,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  historyDate: {
    flex: 1,
  },
  historyDateText: {
    fontSize: 14,
    fontWeight: "500",
  },
  historyTimeText: {
    fontSize: 12,
  },
  historyStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  historyStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  locationCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    marginBottom: 2,
  },
});
