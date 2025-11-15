import {
  CardStyleInterpolators,
  createStackNavigator,
} from "@react-navigation/stack";
import StudentDetailsScreen from "@/app/teacher/class/student/[studentId]";

import HomeScreen from "@/app/teacher/home";
import ProfileScreen from "@/app/teacher/profile";
import ReportsScreen from "@/app/teacher/reports";
import MarksScreen from "@/app/teacher/marks";
import AddEditMarksScreen from "@/app/teacher/marks/add-edit";
import SyncLogsScreen from "@/app/sync-logs";
import AttendanceScreen from "@/app/teacher/attendance";
import ClassDetailsScreen from "@/app/teacher/class/[classId]";
import TakeAttendanceScreen from "@/app/teacher/attendance/[classId]";

const Stack = createStackNavigator();

const TeacherRouter = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="ClassDetails"
        component={ClassDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StudentDetails"
        component={StudentDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TakeAttendance"
        component={TakeAttendanceScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SyncLogs"
        component={SyncLogsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Marks"
        component={MarksScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddEditMarks"
        component={AddEditMarksScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default TeacherRouter;
