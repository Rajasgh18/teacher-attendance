import {
  CardStyleInterpolators,
  createStackNavigator,
} from "@react-navigation/stack";

import ProfileScreen from "./profile";
import Tabs from "./tabs";

const Stack = createStackNavigator();

const PrincipalRouter = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default PrincipalRouter;
