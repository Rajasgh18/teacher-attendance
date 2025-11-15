import { User } from "../types";

// Navigation parameter types
export type CommonStackParamList = {
  Login: undefined;
  DataSync: { user: User };
  Attendance: undefined;
  Profile: undefined;
};
export type TeacherStackParamList = {
  Home: undefined;
  ClassDetails: {
    classId: string;
  };
  StudentDetails: {
    studentId: string;
    classId: string;
  };
  TakeAttendance: {
    classId: string;
  };
  Reports: undefined;
  SyncLogs: undefined;
  Marks: undefined;
  AddEditMarks: {
    mode: "add" | "edit";
    subjectId?: string;
    classId?: string;
    month?: string;
  };
};

export type PrincipalStackParamList = {
  Tabs: {
    screen: "Home" | "Student" | "Class" | "Subject";
  };
};

export type RootStackParamList = CommonStackParamList &
  TeacherStackParamList &
  PrincipalStackParamList;

// Navigation method types
export type NavigationProps = {
  navigate: <T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T],
  ) => void;
  goBack: () => void;
  canGoBack: () => boolean;
  reset: (state: any) => void;
  push: <T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T],
  ) => void;
  pop: (count?: number) => void;
  popToTop: () => void;
  replace: <T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T],
  ) => void;
};

// Screen names type
export type ScreenNames = keyof RootStackParamList;
