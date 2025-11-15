import { useCallback } from "react";
import { useNavigation as useRNNavigation } from "@react-navigation/native";

import NavigationService from "./NavigationService";
import { RootStackParamList, NavigationProps } from "./types";

// Custom hook that provides typed navigation
export const useNavigation = (): NavigationProps => {
  const navigation = useRNNavigation();

  const navigate = useCallback(
    <T extends keyof RootStackParamList>(
      screen: T,
      params?: RootStackParamList[T],
    ) => {
      NavigationService.navigate(screen, params);
    },
    [],
  );

  const push = useCallback(
    <T extends keyof RootStackParamList>(
      screen: T,
      params?: RootStackParamList[T],
    ) => {
      NavigationService.push(screen, params);
    },
    [],
  );

  const replace = useCallback(
    <T extends keyof RootStackParamList>(
      screen: T,
      params?: RootStackParamList[T],
    ) => {
      NavigationService.replace(screen, params);
    },
    [],
  );

  const goBack = useCallback(() => {
    NavigationService.goBack();
  }, []);

  const canGoBack = useCallback(() => {
    return NavigationService.canGoBack();
  }, []);

  const reset = useCallback((state: any) => {
    NavigationService.reset(state);
  }, []);

  const pop = useCallback(
    (_count?: number) => {
      // For pop, we need to use the native navigation
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    },
    [navigation],
  );

  const popToTop = useCallback(() => {
    NavigationService.popToTop();
  }, []);

  return {
    navigate,
    push,
    replace,
    goBack,
    canGoBack,
    reset,
    pop,
    popToTop,
  };
};

// Hook for route parameters
export const useRouteParams = <T extends keyof RootStackParamList>() => {
  const navigation = useRNNavigation();
  const state = navigation.getState();
  const route = state?.routes[state?.index ?? 0];
  return route?.params as RootStackParamList[T];
};

// Hook for current route name
export const useCurrentRoute = () => {
  return NavigationService.getCurrentRoute();
};
