import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertButton } from "@/components/Alert";

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  buttons: AlertButton[];
}

interface AlertContextType {
  alertState: AlertState;
  showAlert: (options: {
    title: string;
    message: string;
    type?: "success" | "error" | "info" | "warning";
    buttons?: AlertButton[];
  }) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

interface AlertProviderProps {
  children: React.ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: "",
    message: "",
    type: "info",
    buttons: [],
  });

  const showAlert = useCallback(
    ({
      title,
      message,
      type = "info",
      buttons = [],
    }: {
      title: string;
      message: string;
      type?: "success" | "error" | "info" | "warning";
      buttons?: AlertButton[];
    }) => {
      setAlertState({
        visible: true,
        title,
        message,
        type,
        buttons,
      });
    },
    [],
  );

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  return (
    <AlertContext.Provider value={{ alertState, showAlert, hideAlert }}>
      {children}
    </AlertContext.Provider>
  );
};
