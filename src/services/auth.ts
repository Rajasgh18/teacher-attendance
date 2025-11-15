import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  AuthResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
} from "@/types/auth";
import { User } from "@/types/user";
import { authApi, handleApiError } from "@/lib/api";

class AuthService {
  private static readonly USER_KEY = "user";
  private static readonly TOKEN_KEY = "access_token";
  private static readonly REFRESH_TOKEN_KEY = "refresh_token";

  /**
   * Login user with employee ID and password
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await authApi.login(credentials);

      if (!response) {
        throw new Error("Login failed");
      }

      const { user, tokens } = response;

      // Store tokens and user data
      await this.storeAuthData(tokens, user);

      return { user, tokens };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Register a new user
   */
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await authApi.register(userData);

      if (!response) {
        throw new Error("Registration failed");
      }

      const { user, tokens } = response;

      // Store tokens and user data
      await this.storeAuthData(tokens, user);

      return { user, tokens };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await this.clearAuthData();
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn("Logout API call failed:", error);
    } finally {
      // Clear stored auth data
      await this.clearAuthData();
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<AuthTokens> {
    try {
      const response = await authApi.refresh();

      if (!response) {
        throw new Error("Token refresh failed");
      }

      const tokens = response;

      // Update stored tokens
      await this.storeTokens(tokens);

      return tokens;
    } catch (error) {
      // If refresh fails, clear auth data and throw error
      await this.clearAuthData();
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await authApi.me();

      if (!response) {
        throw new Error("Failed to get user profile");
      }
      const user = response.user;

      if (!user) {
        throw new Error("User not found");
      }

      // Update stored user data
      await this.storeUser(user);

      return user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(profileData: {
    firstName: string;
    lastName: string;
    employeeId: string;
  }): Promise<User> {
    try {
      const user = await this.getStoredUser();
      if (!user) {
        throw new Error("User not found");
      }

      const { usersApi } = await import("@/lib/api");
      const updatedUser = await usersApi.update(user.id, profileData);

      // Update stored user data
      await this.storeUser(updatedUser);

      return updatedUser;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Change user password
   */
  static async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    try {
      const user = await this.getStoredUser();
      if (!user) {
        throw new Error("User not found");
      }

      const { usersApi } = await import("@/lib/api");
      await usersApi.changePassword(user.id, passwordData);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  static async getCurrentUserFromStore(): Promise<User | null> {
    const user = await this.getStoredUser();
    return user;
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      return !!token;
    } catch {
      return false;
    }
  }

  /**
   * Get stored access token
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  }

  /**
   * Get stored refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  }

  /**
   * Get stored user data
   */
  static async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting stored user:", error);
      return null;
    }
  }

  /**
   * Store authentication data
   */
  private static async storeAuthData(
    tokens: AuthTokens,
    user: User,
  ): Promise<void> {
    await Promise.all([this.storeTokens(tokens), this.storeUser(user)]);
  }

  /**
   * Store tokens
   */
  private static async storeTokens(tokens: AuthTokens): Promise<void> {
    await Promise.all([
      AsyncStorage.setItem(this.TOKEN_KEY, tokens.accessToken),
      AsyncStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken),
    ]);
  }

  /**
   * Store user data
   */
  private static async storeUser(user: User): Promise<void> {
    await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));

    // // Also store in local database
    // try {
    //   const { DatabaseService } = await import("./databaseService");
    //   await DatabaseService.storeUserFromApi(user);
    // } catch (error) {
    //   console.error("Error storing user in database:", error);
    // }
  }

  /**
   * Clear all stored authentication data
   */
  private static async clearAuthData(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(this.TOKEN_KEY),
      AsyncStorage.removeItem(this.REFRESH_TOKEN_KEY),
      AsyncStorage.removeItem(this.USER_KEY),
    ]);
  }
}

export default AuthService;
