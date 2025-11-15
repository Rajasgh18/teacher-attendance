import { DatabaseService } from "./databaseService";
import { API_BASE_URL } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { studentsApi, usersApi } from "@/lib/api";
import { Class, Student } from "@/types";

interface SyncResult {
  success: boolean;
  syncedRecords: number;
  errors: string[];
}

class SyncService {
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  private async makeApiRequest(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    data?: any,
  ): Promise<any> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error("No auth token available");
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  }

  /**
   * Load teacher data from backend and store in local database
   */
  async loadTeacherData(): Promise<void> {
    try {
      // Update sync status to in_progress
      await DatabaseService.updateSyncStatus("teacherData", Date.now());

      const classes = await usersApi.teacherClasses();

      const studentsData: Student[] = [];

      for (const classItem of classes) {
        const students = await studentsApi.list({ classId: classItem.id });
        studentsData.push(...students.data);
      }

      // Store data in local database
      await this.storeTeacherData({
        classes: classes || [],
        students: studentsData || [],
      });

      // Update sync status to success
      await DatabaseService.updateSyncStatus("teacherData", Date.now());
    } catch (error) {
      console.error("Error loading teacher data:", error);

      // Update sync status to failed
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      await DatabaseService.updateSyncStatus("teacherData", Date.now());

      throw new Error(
        `Failed to load teacher data from backend: ${errorMessage}`,
      );
    }
  }

  /**
   * Store teacher data in local database
   */
  private async storeTeacherData(data: {
    classes: Class[];
    students: Student[];
  }): Promise<void> {
    try {
      // Store classes
      if (data.classes.length > 0) {
        for (const classData of data.classes) {
          await DatabaseService.createClass({
            classId: classData.id,
            name: classData.name,
            academicYear: classData.academicYear,
            grade: classData.grade,
            section: classData.section,
            description: classData.description,
            isActive: classData.isActive,
          });
        }
      }

      // Store students
      if (data.students.length > 0) {
        for (const studentData of data.students) {
          await DatabaseService.createStudent({
            studentId: studentData.studentId,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            email: studentData.email || "",
            phone: studentData.phone || "",
            address: studentData.address || "",
            dateOfBirth: studentData.dateOfBirth || "",
            gender: studentData.gender || "",
            classId: studentData.class?.id || "",
            isActive: studentData.isActive,
          });
        }
      }
    } catch (error) {
      console.error("Error storing teacher data:", error);
      throw error;
    }
  }

  /**
   * Sync dirty records to backend
   */
  async syncDirtyRecords(): Promise<SyncResult> {
    try {
      // For now, return empty array since sync tracking is not implemented
      const unsyncedChanges: any[] = [];

      if (unsyncedChanges.length === 0) {
        return { success: true, syncedRecords: 0, errors: [] };
      }

      const errors: string[] = [];
      let syncedRecords = 0;

      // Group changes by table
      const changesByTable = this.groupChangesByTable(unsyncedChanges);

      // Sync each table's changes
      for (const [tableName, changes] of Object.entries(changesByTable)) {
        try {
          const tableSynced = await this.syncTableChanges(tableName, changes);
          syncedRecords += tableSynced;
        } catch (error) {
          console.error(`Error syncing ${tableName}:`, error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          errors.push(`${tableName}: ${errorMessage}`);
        }
      }

      return { success: errors.length === 0, syncedRecords, errors };
    } catch (error) {
      console.error("Error syncing dirty records:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return { success: false, syncedRecords: 0, errors: [errorMessage] };
    }
  }

  /**
   * Group changes by table name
   */
  private groupChangesByTable(changes: any[]): Record<string, any[]> {
    return changes.reduce((groups, change) => {
      if (!groups[change.tableName]) {
        groups[change.tableName] = [];
      }
      groups[change.tableName].push(change);
      return groups;
    }, {});
  }

  /**
   * Sync changes for a specific table
   */
  private async syncTableChanges(
    tableName: string,
    changes: any[],
  ): Promise<number> {
    let syncedCount = 0;

    for (const change of changes) {
      try {
        const data = JSON.parse(change.data);

        switch (change.operation) {
          case "create":
            await this.createRecord(tableName, data);
            break;
          case "update":
            await this.updateRecord(tableName, change.recordId, data);
            break;
          case "delete":
            await this.deleteRecord(tableName, change.recordId);
            break;
        }

        // Mark change as synced (not implemented yet)
        syncedCount++;
      } catch (error) {
        console.error(
          `Error syncing ${change.operation} for ${tableName}:`,
          error,
        );
        throw error;
      }
    }

    return syncedCount;
  }

  /**
   * Create record in backend
   */
  private async createRecord(tableName: string, data: any): Promise<void> {
    const endpoint = this.getEndpointForTable(tableName);
    await this.makeApiRequest(endpoint, "POST", data);
  }

  /**
   * Update record in backend
   */
  private async updateRecord(
    tableName: string,
    recordId: string,
    data: any,
  ): Promise<void> {
    const endpoint = this.getEndpointForTable(tableName);
    await this.makeApiRequest(`${endpoint}/${recordId}`, "PUT", data);
  }

  /**
   * Delete record in backend
   */
  private async deleteRecord(
    tableName: string,
    recordId: string,
  ): Promise<void> {
    const endpoint = this.getEndpointForTable(tableName);
    await this.makeApiRequest(`${endpoint}/${recordId}`, "DELETE");
  }

  /**
   * Get API endpoint for table
   */
  private getEndpointForTable(tableName: string): string {
    const endpoints: Record<string, string> = {
      users: "/users",
      classes: "/classes",
      students: "/students",
      subjects: "/subjects",
      teacherAttendance: "/attendance/teacher",
      studentAttendance: "/attendance/student",
    };

    return endpoints[tableName] || `/${tableName}`;
  }

  /**
   * Clear all local data
   */
  async clearLocalData(): Promise<void> {
    try {
      await DatabaseService.clearAllData();
    } catch (error) {
      console.error("Error clearing local data:", error);
      throw error;
    }
  }
}

export const syncService = new SyncService();
