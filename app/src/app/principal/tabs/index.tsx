import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "./home";
import ClassScreen from "./class";
import SubjectScreen from "./subject";
import { BookOpen, Home, User, Users } from "lucide-react-native";
import TeacherScreen from "./teacher";
import { useTheme } from "@/contexts/ThemeContext";

export type BottomTabParamList = {
  Home: undefined;
  Class: undefined;
  Subject: undefined;
  Teacher: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

function TabIcons({ routeName, color }: { routeName: string; color: string }) {
  const iconProps = {
    color,
    strokeWidth: 1.5,
  };

  switch (routeName) {
    case "Home":
      return <Home {...iconProps} />;
    case "Class":
      return <Users {...iconProps} />;
    case "Subject":
      return <BookOpen {...iconProps} />;
    case "Teacher":
      return <User {...iconProps} />;
  }
}

export default function Tabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarLabelStyle: {
          fontWeight: "600",
        },
        tabBarIcon: ({ focused: _, color }) =>
          TabIcons({ routeName: route.name, color }),
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 12,
        },
      })}
      initialRouteName="Home"
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Class" component={ClassScreen} />
      <Tab.Screen name="Subject" component={SubjectScreen} />
      <Tab.Screen name="Teacher" component={TeacherScreen} />
    </Tab.Navigator>
  );
}
