import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import {
  Clock,
  XCircle,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  SyncLog,
  SyncStats,
  syncLogsService,
} from "@/services/syncLogsService";
import { Appbar } from "@/components/appbar";
import { useTheme } from "@/contexts/ThemeContext";
import { useAlert } from "@/contexts/AlertContext";
import { ConnectivityBanner } from "@/components/ConnectivityBanner";

type FilterType =
  | "all"
  | "success"
  | "failed"
  | "teacher"
  | "student"
  | "marks";

export default function SyncLogs() {
  const { colors } = useTheme();
  const { showAlert } = useAlert();

  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    loadSyncLogs();
  }, [filter]);

  const loadSyncLogs = async () => {
    try {
      setLoading(true);
      const [allLogs, syncStats] = await Promise.all([
        syncLogsService.getSyncLogs(),
        syncLogsService.getSyncStats(),
      ]);

      // Apply filter
      let filteredLogs = allLogs;
      if (filter === "success") {
        filteredLogs = allLogs.filter(log => log.status === "success");
      } else if (filter === "failed") {
        filteredLogs = allLogs.filter(log => log.status === "failed");
      } else if (filter === "teacher") {
        filteredLogs = allLogs.filter(log => log.type === "teacher");
      } else if (filter === "student") {
        filteredLogs = allLogs.filter(log => log.type === "student");
      } else if (filter === "marks") {
        filteredLogs = allLogs.filter(log => log.type === "marks");
      }

      setLogs(filteredLogs);
      setStats(syncStats);
    } catch (error) {
      console.error("Error loading sync logs:", error);
      showAlert({
        title: "Error",
        message: "Failed to load sync logs",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSyncLogs();
    setRefreshing(false);
  };

  const clearLogs = async () => {
    showAlert({
      title: "Clear Logs",
      message: "Are you sure you want to clear all sync logs?",
      type: "warning",
      buttons: [
        {
          text: "Cancel",
          onPress: () => {},
        },
        {
          text: "Clear",
          onPress: async () => {
            try {
              await syncLogsService.clearSyncLogs();
              await loadSyncLogs();
              showAlert({
                title: "Success",
                message: "Sync logs cleared successfully",
                type: "success",
              });
            } catch (error) {
              showAlert({
                title: "Error",
                message: `Failed to clear sync logs: ${error}`,
                type: "error",
              });
            }
          },
        },
      ],
    });
  };

  const getStatusIcon = (status: SyncLog["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle size={16} color={colors.success} />;
      case "failed":
        return <XCircle size={16} color={colors.error} />;
      case "partial":
        return <AlertCircle size={16} color={colors.warning} />;
      default:
        return <Clock size={16} color={colors.textSecondary} />;
    }
  };

  const getStatusText = (status: SyncLog["status"]) => {
    switch (status) {
      case "success":
        return "Success";
      case "failed":
        return "Failed";
      case "partial":
        return "Partial";
      default:
        return "Unknown";
    }
  };

  const getTypeText = (type: SyncLog["type"]) => {
    switch (type) {
      case "teacher":
        return "Teacher";
      case "student":
        return "Student";
      case "marks":
        return "Marks";
      case "all":
        return "All";
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Appbar title="Sync Logs" />
        <ConnectivityBanner />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading sync logs...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Appbar
        title="Sync Logs"
        trailing={
          <TouchableOpacity
            style={[
              styles.clearButton,
              { backgroundColor: colors.errorContainer },
            ]}
            onPress={clearLogs}
          >
            <Trash2 size={20} color={colors.error} />
          </TouchableOpacity>
        }
      />
      <ConnectivityBanner />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Statistics Card */}
        {stats && (
          <View
            style={[
              styles.statsCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.statsTitle, { color: colors.text }]}>
              Sync Statistics
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {stats.totalSyncs}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Total Syncs
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {stats.successfulSyncs}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Successful
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.error }]}>
                  {stats.failedSyncs}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Failed
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.info }]}>
                  {stats.totalRecordsSynced}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Records Synced
                </Text>
              </View>
            </View>
            {stats.lastSyncDate && (
              <Text
                style={[styles.lastSyncText, { color: colors.textSecondary }]}
              >
                Last sync: {syncLogsService.formatTimestamp(stats.lastSyncDate)}
              </Text>
            )}
          </View>
        )}

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <Text style={[styles.filterTitle, { color: colors.text }]}>
            Filter:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: "all", label: "All" },
              { key: "success", label: "Success" },
              { key: "failed", label: "Failed" },
              { key: "teacher", label: "Teacher" },
              { key: "student", label: "Student" },
              { key: "marks", label: "Marks" },
            ].map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor:
                      filter === key ? colors.primary : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setFilter(key as FilterType)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    {
                      color: filter === key ? colors.onPrimary : colors.text,
                    },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Logs List */}
        <View style={styles.logsContainer}>
          <Text style={[styles.logsTitle, { color: colors.text }]}>
            Sync History ({logs.length})
          </Text>
          {logs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No sync logs found
              </Text>
            </View>
          ) : (
            logs.map((log, index) => (
              <View
                key={index}
                style={[
                  styles.logItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.logHeader}>
                  <View style={styles.logStatus}>
                    {getStatusIcon(log.status)}
                    <Text
                      style={[styles.logStatusText, { color: colors.text }]}
                    >
                      {getStatusText(log.status)}
                    </Text>
                  </View>
                  <Text
                    style={[styles.logType, { color: colors.textSecondary }]}
                  >
                    {getTypeText(log.type)}
                  </Text>
                </View>
                <View style={styles.logDetails}>
                  <Text
                    style={[
                      styles.logTimestamp,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {syncLogsService.formatTimestamp(log.timestamp)}
                  </Text>
                  <Text
                    style={[styles.logRecords, { color: colors.textSecondary }]}
                  >
                    {log.syncedRecords} records •{" "}
                    {syncLogsService.formatDuration(log.duration)}
                  </Text>
                </View>
                {log.errors.length > 0 && (
                  <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      {log.errors.join(", ")}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
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
    marginTop: 16,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: 80,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  lastSyncText: {
    fontSize: 12,
    marginTop: 12,
    textAlign: "center",
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  logsContainer: {
    flex: 1,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
  },
  logItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  logStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logStatusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  logType: {
    fontSize: 12,
    fontWeight: "500",
  },
  logDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logTimestamp: {
    fontSize: 12,
  },
  logRecords: {
    fontSize: 12,
  },
  errorContainer: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  errorText: {
    fontSize: 12,
  },
});
