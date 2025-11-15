import { createRef } from "react";
import { NavigationContainerRef } from "@react-navigation/native";

import { RootStackParamList } from "./types";

// Create a ref for the navigation container
export const navigationRef =
  createRef<NavigationContainerRef<RootStackParamList>>();

// Navigation service class
class NavigationService {
  private static instance: NavigationService;

  private constructor() {}

  public static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  // Navigate to a screen with optional parameters
  navigate<T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T],
  ): void {
    if (navigationRef.current) {
      navigationRef.current.navigate(screen as any, params as any);
    } else {
      console.warn("Navigation ref is not ready");
    }
  }

  // Push a new screen onto the stack
  push<T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T],
  ): void {
    if (navigationRef.current) {
      navigationRef.current.navigate(screen as any, params as any);
    } else {
      console.warn("Navigation ref is not ready");
    }
  }

  // Replace current screen
  replace<T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T],
  ): void {
    if (navigationRef.current) {
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: screen as any, params: params as any }],
      });
    } else {
      console.warn("Navigation ref is not ready");
    }
  }

  // Go back to previous screen
  goBack(): void {
    if (navigationRef.current && navigationRef.current.canGoBack()) {
      navigationRef.current.goBack();
    } else {
      console.warn("Cannot go back - no previous screen");
    }
  }

  // Check if can go back
  canGoBack(): boolean {
    return navigationRef.current ? navigationRef.current.canGoBack() : false;
  }

  // Reset navigation state
  reset(state: any): void {
    if (navigationRef.current) {
      navigationRef.current.reset(state);
    } else {
      console.warn("Navigation ref is not ready");
    }
  }

  // Pop to top of stack
  popToTop(): void {
    if (navigationRef.current) {
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: "Dashboard" as any }],
      });
    } else {
      console.warn("Navigation ref is not ready");
    }
  }

  // Get current route name
  getCurrentRoute(): string | undefined {
    return navigationRef.current?.getCurrentRoute()?.name;
  }

  // Navigate to login and clear stack
  navigateToLogin(): void {
    this.reset({
      index: 0,
      routes: [{ name: "Login" as any }],
    });
  }

  // Navigate to dashboard and clear stack
  navigateToDashboard(): void {
    this.reset({
      index: 0,
      routes: [{ name: "Dashboard" as any }],
    });
  }

  // Navigate to data sync
  navigateToDataSync(): void {
    this.navigate("DataSync");
  }

  // Navigate to attendance
  navigateToAttendance(): void {
    this.navigate("Attendance");
  }

  // Navigate to profile
  navigateToProfile(): void {
    this.navigate("Profile");
  }

  // Navigate to class details
  navigateToClassDetails(classId: string): void {
    this.navigate("ClassDetails", { classId });
  }

  // Navigate to student details
  navigateToStudentDetails(studentId: string, classId: string): void {
    this.navigate("StudentDetails", { studentId, classId });
  }

  // Navigate to take attendance
  navigateToTakeAttendance(classId: string): void {
    this.navigate("TakeAttendance", { classId });
  }

  // Navigate to reports
  navigateToReports(): void {
    this.navigate("Reports");
  }
}

// Export singleton instance
export default NavigationService.getInstance();
