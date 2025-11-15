// Export types
export type { RootStackParamList, NavigationProps, ScreenNames } from "./types";

// Export navigation service
export {
  default as NavigationService,
  navigationRef,
} from "./NavigationService";

// Export hooks
export {
  useNavigation,
  useRouteParams,
  useCurrentRoute,
} from "./useNavigation";

// Export navigation utilities
export * from "./types";
