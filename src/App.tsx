import React from "react";
import { enableScreens } from "react-native-screens";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Alert from "@/components/Alert";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { navigationRef } from "@/navigation/NavigationService";
import { DatabaseProvider } from "@/components/DatabaseProvider";
import { AlertProvider, useAlert } from "@/contexts/AlertContext";
import { autoSyncService } from "@/services/autoSyncService";
import AppRouter from "./app/app-router";
import Tabs from "./app/principal/tabs";

enableScreens();

const AppContent = () => {
  const { hideAlert, alertState } = useAlert();

  // Initialize auto sync service
  React.useEffect(() => {
    autoSyncService.initialize();

    return () => {
      autoSyncService.cleanup();
    };
  }, []);

  return (
    <>
      <Alert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        buttons={alertState.buttons}
        onDismiss={hideAlert}
      />
      <NavigationContainer ref={navigationRef}>
        <AppRouter />
      </NavigationContainer>
    </>
  );
};

const App = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <DatabaseProvider>
          <ThemeProvider>
            <AlertProvider>
              <AppContent />
            </AlertProvider>
          </ThemeProvider>
        </DatabaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
