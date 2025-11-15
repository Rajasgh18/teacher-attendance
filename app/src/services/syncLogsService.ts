import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SyncLog {
  id: string;
  timestamp: number;
  type: "teacher" | "student" | "marks" | "all";
  status: "success" | "failed" | "partial";
  syncedRecords: number;
  errors: string[];
  duration: number; // in milliseconds
}

export interface SyncStats {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  totalRecordsSynced: number;
  lastSyncDate?: number;
  averageSyncDuration: number;
}

class SyncLogsService {
  private readonly SYNC_LOGS_KEY = "sync_logs";
  private readonly MAX_LOGS = 100; // Keep only last 100 logs

  /**
   * Add a new sync log entry
   */
  async addSyncLog(log: Omit<SyncLog, "id">): Promise<void> {
    try {
      const logs = await this.getSyncLogs();
      const newLog: SyncLog = {
        ...log,
        id: Date.now().toString(),
      };

      logs.unshift(newLog); // Add to beginning

      // Keep only the last MAX_LOGS entries
      if (logs.length > this.MAX_LOGS) {
        logs.splice(this.MAX_LOGS);
      }

      await AsyncStorage.setItem(this.SYNC_LOGS_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error("Error adding sync log:", error);
    }
  }

  /**
   * Get all sync logs
   */
  async getSyncLogs(): Promise<SyncLog[]> {
    try {
      const logsJson = await AsyncStorage.getItem(this.SYNC_LOGS_KEY);
      return logsJson ? JSON.parse(logsJson) : [];
    } catch (error) {
      console.error("Error getting sync logs:", error);
      return [];
    }
  }

  /**
   * Get sync logs filtered by type
   */
  async getSyncLogsByType(type: SyncLog["type"]): Promise<SyncLog[]> {
    const logs = await this.getSyncLogs();
    return logs.filter(log => log.type === type);
  }

  /**
   * Get sync logs filtered by status
   */
  async getSyncLogsByStatus(status: SyncLog["status"]): Promise<SyncLog[]> {
    const logs = await this.getSyncLogs();
    return logs.filter(log => log.status === status);
  }

  /**
   * Get sync logs for a specific date range
   */
  async getSyncLogsByDateRange(
    startDate: number,
    endDate: number,
  ): Promise<SyncLog[]> {
    const logs = await this.getSyncLogs();
    return logs.filter(
      log => log.timestamp >= startDate && log.timestamp <= endDate,
    );
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<SyncStats> {
    const logs = await this.getSyncLogs();

    if (logs.length === 0) {
      return {
        totalSyncs: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        totalRecordsSynced: 0,
        averageSyncDuration: 0,
      };
    }

    const successfulSyncs = logs.filter(log => log.status === "success").length;
    const failedSyncs = logs.filter(log => log.status === "failed").length;
    const totalRecordsSynced = logs.reduce(
      (sum, log) => sum + log.syncedRecords,
      0,
    );
    const totalDuration = logs.reduce((sum, log) => sum + log.duration, 0);
    const averageSyncDuration = totalDuration / logs.length;

    return {
      totalSyncs: logs.length,
      successfulSyncs,
      failedSyncs,
      totalRecordsSynced,
      lastSyncDate: logs[0]?.timestamp,
      averageSyncDuration,
    };
  }

  /**
   * Clear all sync logs
   */
  async clearSyncLogs(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SYNC_LOGS_KEY);
    } catch (error) {
      console.error("Error clearing sync logs:", error);
    }
  }

  /**
   * Get recent sync logs (last N entries)
   */
  async getRecentSyncLogs(limit: number = 10): Promise<SyncLog[]> {
    const logs = await this.getSyncLogs();
    return logs.slice(0, limit);
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  /**
   * Format duration for display
   */
  formatDuration(duration: number): string {
    if (duration < 1000) {
      return `${duration}ms`;
    }
    return `${(duration / 1000).toFixed(1)}s`;
  }
}

export const syncLogsService = new SyncLogsService();
