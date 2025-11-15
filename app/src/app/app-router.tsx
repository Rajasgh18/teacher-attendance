import React, { useEffect } from "react";

import { AuthService } from "@/services";
import { UserRole } from "@/types";
import { useNavigation } from "@/navigation";
import { useUserStore } from "@/stores/userStore";
import { useDatabase } from "@/components/DatabaseProvider";
import LoginScreen from "@/app/login";
import DataSyncScreen from "@/app/data-sync";
import SplashScreen from "@/app/splash-screen";
import {
  CardStyleInterpolators,
  createStackNavigator,
} from "@react-navigation/stack";
import PrincipalRouter from "./principal/router";
import TeacherRouter from "./teacher/router";

const Stack = createStackNavigator();

const AppRouter = () => {
  const { setUser } = useUserStore();
  const navigation = useNavigation();
  const { isLoading: isDatabaseLoading } = useDatabase();

  useEffect(() => {
    if (isDatabaseLoading) {
      return;
    }

    AuthService.isAuthenticated().then(async isAuthenticated => {
      if (isAuthenticated) {
        try {
          const tempUser = await AuthService.getCurrentUserFromStore();
          navigation.reset({
            index: 0,
            routes: [
              {
                name:
                  tempUser?.role === UserRole.PRINCIPAL
                    ? "Principal"
                    : "Teacher",
              },
            ],
          });
          setUser(tempUser);
        } catch (error) {
          console.error("Error getting current user:", error);
        }
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }
    });
  }, [isDatabaseLoading]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
      initialRouteName="Splash"
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="DataSync" component={DataSyncScreen} />
      <Stack.Screen name="Principal" component={PrincipalRouter} />
      <Stack.Screen name="Teacher" component={TeacherRouter} />
    </Stack.Navigator>
  );
};

export default AppRouter;
