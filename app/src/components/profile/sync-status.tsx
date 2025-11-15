import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import {
  User,
  Clock,
  Calendar,
  Database,
  RefreshCw,
  CheckCircle,
  BookOpen,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";

import { useUserStore } from "@/stores/userStore";
import { useTheme } from "@/contexts/ThemeContext";
import { useAlert } from "@/contexts/AlertContext";
import { useConnectivity } from "@/hooks/useConnectivity";
import { resyncService, SYNC_FREQUENCIES } from "@/services/resyncService";

export const SyncStatus = () => {
  const { user } = useUserStore();
  const { colors } = useTheme();
  const { showAlert } = useAlert();
  const { isOnline } = useConnectivity();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState<{
    teacherAttendanceCount: number;
    studentAttendanceCount: number;
    marksCount: number;
    lastSyncDate?: string;
  }>({
    teacherAttendanceCount: 0,
    studentAttendanceCount: 0,
    marksCount: 0,
  });
  const [pendingSync, setPendingSync] = useState<{
    teacherAttendancePending: number;
    studentAttendancePending: number;
    marksPending: number;
    totalPending: number;
  }>({
    teacherAttendancePending: 0,
    studentAttendancePending: 0,
    marksPending: 0,
    totalPending: 0,
  });
  const [selectedSyncFrequency, setSelectedSyncFrequency] =
    useState<string>("daily");
  const [showSyncFrequencyModal, setShowSyncFrequencyModal] = useState(false);

  const handleSyncData = async () => {
    if (!user?.id) return;

    // Check internet connectivity
    if (!isOnline) {
      showAlert({
        title: "No Internet Connection",
        message: "Please check your internet connection and try again.",
        type: "error",
      });
      return;
    }

    setIsSyncing(true);
    try {
      const result = await resyncService.syncAllAttendance(user.id);

      if (result.totalErrors.length === 0) {
        showAlert({
          title: "Sync Successful",
          message: `Successfully synced ${result.totalSynced} attendance records to the server.`,
          type: "success",
        });
        // Reload sync stats
        await loadSyncData();
      } else {
        showAlert({
          title: "Sync Completed with Errors",
          message: `Synced ${result.totalSynced} records but encountered ${result.totalErrors.length} errors.`,
          type: "warning",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sync data";
      showAlert({
        title: "Sync Failed",
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncFrequencyChange = async (frequency: string) => {
    try {
      await resyncService.saveSyncFrequency(
        frequency as "daily" | "weekly" | "monthly",
      );
      setSelectedSyncFrequency(frequency);
      setShowSyncFrequencyModal(false);
      showAlert({
        title: "Sync Frequency Updated",
        message: `Data will now sync ${frequency.toLowerCase()}.`,
        type: "success",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update sync frequency";
      showAlert({
        title: "Error",
        message: errorMessage,
        type: "error",
      });
    }
  };

  useEffect(() => {
    loadSyncData();
  }, []);

  const loadSyncData = async () => {
    if (!user?.id) return;

    try {
      const [stats, pending, frequency] = await Promise.all([
        resyncService.getSyncStats(user.id),
        resyncService.getPendingSyncCount(user.id),
        resyncService.getSyncFrequency(),
      ]);
      setSyncStats(stats);
      setPendingSync(pending);
      // Set frequency to saved value or default to "daily"
      setSelectedSyncFrequency(frequency || "daily");
    } catch (error) {
      console.error("Error loading sync data:", error);
    }
  };

  return (
    <>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Data Synchronization
        </Text>
        <View
          style={[
            styles.formCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Sync Stats */}
          <View style={styles.syncStatsContainer}>
            <View style={styles.syncStatItem}>
              <Database size={20} color={colors.primary} />
              <View style={styles.syncStatText}>
                <Text style={[styles.syncStatNumber, { color: colors.text }]}>
                  {syncStats.teacherAttendanceCount}
                </Text>
                <Text
                  style={[
                    styles.syncStatLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Teacher Records
                </Text>
                {pendingSync.teacherAttendancePending > 0 && (
                  <Text
                    style={[styles.pendingSyncText, { color: colors.warning }]}
                  >
                    {pendingSync.teacherAttendancePending} pending
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.syncStatItem}>
              <User size={20} color={colors.primary} />
              <View style={styles.syncStatText}>
                <Text style={[styles.syncStatNumber, { color: colors.text }]}>
                  {syncStats.studentAttendanceCount}
                </Text>
                <Text
                  style={[
                    styles.syncStatLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Student Records
                </Text>
                {pendingSync.studentAttendancePending > 0 && (
                  <Text
                    style={[styles.pendingSyncText, { color: colors.warning }]}
                  >
                    {pendingSync.studentAttendancePending} pending
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.syncStatItem}>
              <BookOpen size={20} color={colors.primary} />
              <View style={styles.syncStatText}>
                <Text style={[styles.syncStatNumber, { color: colors.text }]}>
                  {syncStats.marksCount}
                </Text>
                <Text
                  style={[
                    styles.syncStatLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Marks Records
                </Text>
                {pendingSync.marksPending > 0 && (
                  <Text
                    style={[styles.pendingSyncText, { color: colors.warning }]}
                  >
                    {pendingSync.marksPending} pending
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Pending Sync Summary */}
          {pendingSync.totalPending > 0 && (
            <View
              style={[
                styles.pendingSyncContainer,
                {
                  borderColor: colors.warning,
                  backgroundColor: colors.warning + "20",
                },
              ]}
            >
              <View style={styles.pendingSyncHeader}>
                <Text
                  style={[styles.pendingSyncTitle, { color: colors.warning }]}
                >
                  Pending Sync
                </Text>
                <Text
                  style={[styles.pendingSyncCount, { color: colors.warning }]}
                >
                  {pendingSync.totalPending} records
                </Text>
              </View>
              <Text
                style={[
                  styles.pendingSyncDescription,
                  { color: colors.textSecondary },
                ]}
              >
                These records need to be synced to the server
              </Text>
            </View>
          )}

          {/* Last Sync Info */}
          {syncStats.lastSyncDate && (
            <View style={styles.lastSyncContainer}>
              <Clock size={16} color={colors.textSecondary} />
              <Text
                style={[styles.lastSyncText, { color: colors.textSecondary }]}
              >
                Last synced:{" "}
                {new Date(syncStats.lastSyncDate).toLocaleDateString()}
              </Text>
            </View>
          )}

          {/* Sync Frequency */}
          <View style={styles.syncFrequencyContainer}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Sync Frequency
            </Text>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceElevated,
                },
              ]}
              onPress={() => setShowSyncFrequencyModal(true)}
            >
              <Calendar size={16} color={colors.text} />
              <Text
                style={[styles.frequencyButtonText, { color: colors.text }]}
              >
                {SYNC_FREQUENCIES.find(f => f.type === selectedSyncFrequency)
                  ?.label || "Daily"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Manual Sync Button */}
          <TouchableOpacity
            style={[
              styles.syncButton,
              { backgroundColor: colors.primary },
              isSyncing && { opacity: 0.7 },
            ]}
            onPress={handleSyncData}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <RefreshCw size={20} color={colors.onPrimary} />
            )}
            <Text style={[styles.syncButtonText, { color: colors.onPrimary }]}>
              {isSyncing
                ? "Syncing..."
                : pendingSync.totalPending > 0
                ? `Sync Now (${pendingSync.totalPending})`
                : "Sync Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Sync Frequency Modal */}
      <Modal
        visible={showSyncFrequencyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSyncFrequencyModal(false)}
      >
        <View
          style={[styles.modalOverlay, { backgroundColor: colors.backdrop }]}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Sync Frequency
              </Text>
              <TouchableOpacity
                onPress={() => setShowSyncFrequencyModal(false)}
                style={styles.modalCloseButton}
              >
                <Text
                  style={[
                    styles.modalCloseText,
                    { color: colors.textSecondary },
                  ]}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={[styles.modalDescription, { color: colors.textSecondary }]}
            >
              Choose how often your attendance data should be automatically
              synced to the server.
            </Text>

            {SYNC_FREQUENCIES.map(frequency => (
              <TouchableOpacity
                key={frequency.type}
                style={[
                  styles.frequencyOption,
                  { borderColor: colors.border },
                  selectedSyncFrequency === frequency.type && {
                    borderColor: colors.primary,
                    backgroundColor: colors.primaryContainer,
                  },
                ]}
                onPress={() => handleSyncFrequencyChange(frequency.type)}
              >
                <View style={styles.frequencyOptionContent}>
                  <Text
                    style={[
                      styles.frequencyOptionLabel,
                      { color: colors.text },
                      selectedSyncFrequency === frequency.type && {
                        color: colors.primary,
                      },
                    ]}
                  >
                    {frequency.label}
                  </Text>
                  <Text
                    style={[
                      styles.frequencyOptionDescription,
                      { color: colors.textSecondary },
                      selectedSyncFrequency === frequency.type && {
                        color: colors.primary,
                      },
                    ]}
                  >
                    {frequency.description}
                  </Text>
                </View>
                {selectedSyncFrequency === frequency.type && (
                  <CheckCircle size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  syncStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 12,
  },
  syncStatItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: "30%",
    gap: 12,
  },
  syncStatText: {
    flex: 1,
  },
  syncStatNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  syncStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  lastSyncContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
  },
  lastSyncText: {
    fontSize: 14,
  },
  syncFrequencyContainer: {
    marginBottom: 16,
  },
  frequencyButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginTop: 8,
  },
  frequencyButtonText: {
    fontSize: 16,
  },
  formCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  syncButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  frequencyOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  frequencyOptionContent: {
    flex: 1,
  },
  frequencyOptionLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  frequencyOptionDescription: {
    fontSize: 12,
  },
  pendingSyncText: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },
  pendingSyncContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  pendingSyncHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  pendingSyncTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  pendingSyncCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  pendingSyncDescription: {
    fontSize: 12,
  },
});
