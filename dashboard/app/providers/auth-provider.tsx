import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { authStorage } from "@/lib/auth-storage";
import { authService } from "@/services/auth-service";
import type { AuthTokens, AuthUser, LoginPayload } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isRefreshing: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<AuthTokens | null>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const token = authStorage.getAccessToken();
      if (!token) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const { user: profile } = await authService.getProfile();
        if (isMounted) {
          setUser(profile);
        }
      } catch (error) {
        if (isMounted) {
          authStorage.clear();
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { user: authenticatedUser, tokens } =
      await authService.login(payload);

    authStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    setUser(authenticatedUser);

    return authenticatedUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore logout errors, client-side cleanup still happens
    } finally {
      authStorage.clear();
      setUser(null);
    }
  }, []);

  const refreshTokens = useCallback(async () => {
    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) {
      await logout();
      return null;
    }

    setIsRefreshing(true);
    try {
      const { tokens } = await authService.refreshToken(refreshToken);
      authStorage.setTokens(tokens.accessToken, tokens.refreshToken);
      return tokens;
    } catch (error) {
      await logout();
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isRefreshing,
      login,
      logout,
      refreshTokens,
      setUser,
    }),
    [isLoading, isRefreshing, login, logout, refreshTokens, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
