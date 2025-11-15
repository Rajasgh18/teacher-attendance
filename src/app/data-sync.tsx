import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { Database, AlertTriangle } from "lucide-react-native";
import { useRoute, RouteProp } from "@react-navigation/native";

import { User, UserRole } from "@/types";
import { useUserStore } from "@/stores/userStore";
import DataSyncService from "@/services/dataSyncService";
import { useAlert } from "@/contexts/AlertContext";
import { useTheme } from "@/contexts/ThemeContext";
import { AuthService } from "@/services";
import { useNavigation } from "@/navigation";

type DataSyncScreenRouteProp = RouteProp<
  {
    DataSync: { user: User };
  },
  "DataSync"
>;

const DataSyncScreen = () => {
  const { showAlert } = useAlert();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { setUser } = useUserStore();
  const route = useRoute<DataSyncScreenRouteProp>();

  const [_isLoading, setIsLoading] = useState(true);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [existingUserName, setExistingUserName] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    initializeDataSync();
  }, []);

  const initializeDataSync = async () => {
    try {
      setIsLoading(true);

      let user: User | null = route.params?.user;
      if (!user) {
        const currUser = await AuthService.getCurrentUserFromStore();
        if (currUser) {
          user = currUser;
        }
      }

      setCurrentUser(user);

      // Check if there's existing data for a different user
      const existingDataCheck =
        await DataSyncService.hasExistingDataForDifferentUser(user.id);

      if (existingDataCheck.hasData) {
        setExistingUserName(
          existingDataCheck.existingUserName || "Another user",
        );
        setShowConflictDialog(true);
        setIsLoading(false);
        return;
      }

      // No conflict, proceed with data loading
      await loadData(user.id, user.role, user.schoolId);
      navigateToDashboard();
    } catch (error) {
      console.error("Error in data sync initialization:", error);
      showAlert({
        title: "Error",
        message: "Failed to initialize data sync. Please try again.",
        type: "error",
        buttons: [
          {
            text: "Retry",
            onPress: initializeDataSync,
          },
          {
            text: "Skip",
            onPress: () => navigateToDashboard(),
          },
        ],
      });
    }
  };

  const loadData = async (userId: string, role: UserRole, schoolId: string) => {
    try {
      // Clear any existing data first
      await DataSyncService.clearExistingData();

      // Load new teacher data
      if (role === UserRole.PRINCIPAL) {
        await DataSyncService.loadPrincipalData(schoolId);
      } else {
        await DataSyncService.loadTeacherData(userId);
      }
    } catch (error) {
      console.error("Error loading teacher data:", error);
      showAlert({
        title: "Error",
        message:
          "Failed to load teacher data. Please check your connection and try again.",
        type: "error",
        buttons: [
          {
            text: "Retry",
            onPress: () => loadData(userId, role, schoolId),
          },
          {
            text: "Skip",
            onPress: () => navigateToDashboard(),
          },
        ],
      });
    }
  };

  const handleConflictResolution = async (shouldClear: boolean) => {
    if (!currentUser) return;

    setShowConflictDialog(false);
    setIsLoading(true);

    try {
      if (shouldClear) {
        await DataSyncService.clearExistingData();
      }

      await loadData(currentUser.id, currentUser.role, currentUser.schoolId);
      navigateToDashboard();
    } catch (error) {
      console.error("Error resolving data conflict:", error);
      showAlert({
        title: "Error",
        message: "Failed to resolve data conflict. Please try again.",
        type: "error",
        buttons: [
          {
            text: "Retry",
            onPress: () => handleConflictResolution(shouldClear),
          },
          {
            text: "Skip",
            onPress: () => navigateToDashboard(),
          },
        ],
      });
    }
  };

  const navigateToDashboard = () => {
    if (currentUser) {
      setUser(currentUser);
    }
    navigation.reset({
      index: 0,
      routes: [
        {
          name:
            currentUser && currentUser.role === UserRole.PRINCIPAL
              ? "Principal"
              : "Teacher",
        },
      ],
    });
  };

  const renderConflictDialog = () => (
    <View style={[styles.conflictDialog, { backgroundColor: colors.backdrop }]}>
      <View
        style={[
          styles.conflictContent,
          { backgroundColor: colors.surfaceElevated },
        ]}
      >
        <AlertTriangle
          size={48}
          color={colors.warning}
          style={styles.conflictIcon}
        />
        <Text style={[styles.conflictTitle, { color: colors.text }]}>
          Existing Data Found
        </Text>
        <Text style={[styles.conflictMessage, { color: colors.textSecondary }]}>
          We found data for {existingUserName} on this device. Would you like
          to:
        </Text>

        <View style={styles.conflictOptions}>
          <TouchableOpacity
            style={[
              styles.conflictButton,
              styles.clearButton,
              { backgroundColor: colors.error },
            ]}
            onPress={() => handleConflictResolution(true)}
          >
            <Text style={[styles.clearButtonText, { color: colors.onPrimary }]}>
              Clear & Load My Data
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.conflictButton,
              styles.keepButton,
              { backgroundColor: colors.primary },
            ]}
            onPress={() => handleConflictResolution(false)}
          >
            <Text style={[styles.keepButtonText, { color: colors.onPrimary }]}>
              Keep Existing Data
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderLoadingState = () => (
    <View
      style={[styles.loadingContainer, { backgroundColor: colors.background }]}
    >
      <View style={styles.loadingContent}>
        <Database size={64} color={colors.primary} style={styles.loadingIcon} />
        <Text style={[styles.loadingTitle, { color: colors.text }]}>
          Setting Up Your Data
        </Text>

        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.spinner}
        />
      </View>
    </View>
  );

  if (showConflictDialog) {
    return renderConflictDialog();
  }

  return renderLoadingState();
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingContent: {
    alignItems: "center",
    maxWidth: 300,
  },
  loadingIcon: {
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  spinner: {
    marginTop: 16,
  },
  conflictDialog: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  conflictContent: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    maxWidth: 320,
    width: "100%",
  },
  conflictIcon: {
    marginBottom: 16,
  },
  conflictTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  conflictMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  conflictOptions: {
    width: "100%",
    gap: 12,
  },
  conflictButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  clearButton: {
    // Handled dynamically
  },
  clearButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  keepButton: {
    // Handled dynamically
  },
  keepButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
});

export default DataSyncScreen;
