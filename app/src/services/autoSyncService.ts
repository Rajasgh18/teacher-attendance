import { AppState, AppStateStatus } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { resyncService } from "./resyncService";
import { syncLogsService } from "./syncLogsService";
import { useUserStore } from "@/stores/userStore";

interface AutoSyncConfig {
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly";
  lastAutoSync?: number;
  nextAutoSync?: number;
}

class AutoSyncService {
  private config: AutoSyncConfig = {
    enabled: false,
    frequency: "daily",
  };
  private syncInProgress = false;
  private appStateListener: any;
  private networkListener: any;

  /**
   * Initialize automatic sync service
   */
  async initialize(): Promise<void> {
    try {
      // Load configuration
      await this.loadConfig();

      // Set up listeners
      this.setupAppStateListener();
      this.setupNetworkListener();

      // Check if it's time to sync
      await this.checkAndSync();
    } catch (error) {
      console.error("Error initializing auto sync service:", error);
    }
  }

  /**
   * Load auto sync configuration
   */
  private async loadConfig(): Promise<void> {
    try {
      const frequency = await resyncService.getSyncFrequency();
      if (frequency) {
        this.config.frequency = frequency;
        this.config.enabled = true;
      }
    } catch (error) {
      console.error("Error loading auto sync config:", error);
    }
  }

  /**
   * Set up app state listener for background sync
   */
  private setupAppStateListener(): void {
    this.appStateListener = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          // App came to foreground, check if we need to sync
          this.checkAndSync();
        }
      },
    );
  }

  /**
   * Set up network listener for connectivity changes
   */
  private setupNetworkListener(): void {
    this.networkListener = NetInfo.addEventListener(state => {
      if (state.isConnected && this.config.enabled) {
        // Network became available, check if we need to sync
        this.checkAndSync();
      }
    });
  }

  /**
   * Check if it's time to sync and perform sync if needed
   */
  private async checkAndSync(): Promise<void> {
    if (this.syncInProgress || !this.config.enabled) {
      return;
    }

    const now = Date.now();
    const shouldSync = this.shouldSyncNow(now);

    if (shouldSync) {
      await this.performAutoSync();
    }
  }

  /**
   * Determine if we should sync now based on frequency
   */
  private shouldSyncNow(now: number): boolean {
    const { frequency, lastAutoSync } = this.config;

    if (!lastAutoSync) {
      return true; // First time sync
    }

    const lastSyncDate = new Date(lastAutoSync);
    const currentDate = new Date(now);

    switch (frequency) {
      case "daily":
        // Sync if it's a new day
        return (
          lastSyncDate.getDate() !== currentDate.getDate() ||
          lastSyncDate.getMonth() !== currentDate.getMonth() ||
          lastSyncDate.getFullYear() !== currentDate.getFullYear()
        );

      case "weekly": {
        // Sync if it's Sunday and different week
        const lastWeek = this.getWeekNumber(lastSyncDate);
        const currentWeek = this.getWeekNumber(currentDate);
        const currentDay = currentDate.getDay();
        return currentDay === 0 && lastWeek !== currentWeek;
      }

      case "monthly":
        // Sync if it's the 1st of the month and different month
        return (
          currentDate.getDate() === 1 &&
          (lastSyncDate.getMonth() !== currentDate.getMonth() ||
            lastSyncDate.getFullYear() !== currentDate.getFullYear())
        );

      default:
        return false;
    }
  }

  /**
   * Get week number of the year
   */
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  /**
   * Perform automatic sync
   */
  private async performAutoSync(): Promise<void> {
    if (this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    const startTime = Date.now();

    try {
      // Check network connectivity
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        console.info("Auto sync skipped: No internet connection");
        return;
      }

      // Get current user
      const userStore = useUserStore.getState();
      const user = userStore.user;

      if (!user || user.role !== "teacher") {
        console.info("Auto sync skipped: No teacher user found");
        return;
      }

      console.info("Starting automatic sync...");

      // Perform sync
      const result = await resyncService.syncAllAttendance(user.id);

      // Log the auto sync
      await syncLogsService.addSyncLog({
        timestamp: Date.now(),
        type: "all",
        status: result.totalErrors.length === 0 ? "success" : "partial",
        syncedRecords: result.totalSynced,
        errors: result.totalErrors,
        duration: Date.now() - startTime,
      });

      // Update last auto sync time
      this.config.lastAutoSync = Date.now();
      await this.saveConfig();

      console.info(`Auto sync completed: ${result.totalSynced} records synced`);
    } catch (error) {
      console.error("Auto sync failed:", error);

      // Log the failed auto sync
      await syncLogsService.addSyncLog({
        timestamp: Date.now(),
        type: "all",
        status: "failed",
        syncedRecords: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        duration: Date.now() - startTime,
      });
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Save auto sync configuration
   */
  private async saveConfig(): Promise<void> {
    // This could be saved to AsyncStorage or other persistent storage
    // For now, we'll just update the in-memory config
    console.info("Auto sync config updated:", this.config);
  }

  /**
   * Enable automatic sync
   */
  async enable(frequency: "daily" | "weekly" | "monthly"): Promise<void> {
    this.config.enabled = true;
    this.config.frequency = frequency;
    await this.saveConfig();
    console.info(`Auto sync enabled with frequency: ${frequency}`);
  }

  /**
   * Disable automatic sync
   */
  async disable(): Promise<void> {
    this.config.enabled = false;
    await this.saveConfig();
    console.info("Auto sync disabled");
  }

  /**
   * Get current auto sync configuration
   */
  getConfig(): AutoSyncConfig {
    return { ...this.config };
  }

  /**
   * Manually trigger a sync (for testing or immediate sync)
   */
  async triggerSync(): Promise<void> {
    if (this.syncInProgress) {
      console.info("Sync already in progress");
      return;
    }

    await this.performAutoSync();
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    if (this.appStateListener) {
      this.appStateListener.remove();
    }
    if (this.networkListener) {
      this.networkListener();
    }
  }
}

export const autoSyncService = new AutoSyncService();
