import Geolocation from "@react-native-community/geolocation";
import AttendanceService from "./attendance";
import { NativeModules, Platform, DeviceEventEmitter } from "react-native";
import UsersService from "./users";

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

class BackgroundLocationService {
  private locationInterval: NodeJS.Timeout | null = null;
  private isTracking = false;
  private currentAttendanceId: string | null = null;
  private teacherId: string | null = null;
  private eventSubscription: any = null;

  /**
   * Start background location tracking every 5 minutes
   */
  startTracking(attendanceId: string, teacherId: string): void {
    if (this.isTracking) {
      console.log("Location tracking already active");
      return;
    }

    this.currentAttendanceId = attendanceId;
    this.teacherId = teacherId;
    this.isTracking = true;

    // Try to use native service for Android background tracking
    if (Platform.OS === "android" && NativeModules.LocationTrackingModule) {
      try {
        NativeModules.LocationTrackingModule.startLocationTracking();
        this.setupNativeEventListeners();
        console.log("Native Android location tracking started");
        return;
      } catch (error) {
        console.log(
          "Native service not available, falling back to JS tracking",
        );
      }
    }

    // Fallback to JavaScript-based tracking (works when app is active/background)
    this.startJSTracking();
  }

  /**
   * Start JavaScript-based location tracking (app must be active/background)
   */
  private startJSTracking(): void {
    // Start tracking immediately
    this.trackLocation();
    this.locationInterval = setInterval(() => {
      this.trackLocation();
    }, 30000);
  }

  /**
   * Setup native event listeners for location updates
   */
  private setupNativeEventListeners(): void {
    if (Platform.OS === "android" && NativeModules.LocationTrackingModule) {
      // Listen for the broadcast intent
      this.eventSubscription = DeviceEventEmitter.addListener(
        "onLocationUpdate",
        (data: { latitude: number; longitude: number; timestamp: number }) => {
          this.handleNativeLocationUpdate(data);
        },
      );
    }
  }

  /**
   * Handle location updates from native service
   */
  private async handleNativeLocationUpdate(data: {
    latitude: number;
    longitude: number;
    timestamp: number;
  }): Promise<void> {
    if (this.currentAttendanceId) {
      try {
        await UsersService.pushLiveLocation(data.latitude, data.longitude);
      } catch (error) {
        console.error("Error updating location from native service:", error);
      }
    }
  }

  /**
   * Stop background location tracking
   */
  stopTracking(): void {
    // Stop native Android service if available
    if (Platform.OS === "android" && NativeModules.LocationTrackingModule) {
      try {
        NativeModules.LocationTrackingModule.stopLocationTracking();
      } catch (error) {
        console.error("Error stopping native service:", error);
      }
    }

    // Stop JavaScript-based tracking
    if (this.locationInterval) {
      clearInterval(this.locationInterval);
      this.locationInterval = null;
    }

    // Clean up native event listeners
    if (this.eventSubscription) {
      this.eventSubscription.remove();
      this.eventSubscription = null;
    }

    this.isTracking = false;
    this.currentAttendanceId = null;
    this.teacherId = null;
  }

  /**
   * Track current location and update attendance record
   */
  private async trackLocation(): Promise<void> {
    if (!this.currentAttendanceId || !this.teacherId) {
      return;
    }

    try {
      const location = await this.getCurrentLocation();
      if (location) {
        await UsersService.pushLiveLocation(
          location.latitude,
          location.longitude,
        );
      }
    } catch (error) {
      console.error("Error tracking location:", error);
    }
  }

  /**
   * Get current location with timeout and error handling
   */
  private getCurrentLocation(): Promise<LocationData | null> {
    return new Promise(resolve => {
      Geolocation.getCurrentPosition(
        (position: any) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now(),
          };
          resolve(locationData);
        },
        (error: any) => {
          console.error(
            "Error getting location for background tracking:",
            error,
          );
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10 second timeout
          maximumAge: 60000, // Accept locations up to 1 minute old
        },
      );
    });
  }

  /**
   * Check if location tracking is currently active
   */
  isLocationTrackingActive(): boolean {
    return this.isTracking;
  }

  /**
   * Get current tracking status
   */
  getTrackingStatus(): {
    isTracking: boolean;
    attendanceId: string | null;
    teacherId: string | null;
  } {
    return {
      isTracking: this.isTracking,
      attendanceId: this.currentAttendanceId,
      teacherId: this.teacherId,
    };
  }
}

// Export singleton instance
export const backgroundLocationService = new BackgroundLocationService();
