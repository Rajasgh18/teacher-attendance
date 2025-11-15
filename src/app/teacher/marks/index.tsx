import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Download, Plus } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Marks, Student, Subject, Class } from "@/types";
import { Appbar } from "@/components/appbar";
import { useNavigation } from "@/navigation";
import { MarksList } from "@/components/marks";
import { Dropdown } from "@/components/Dropdown";
import { useUserStore } from "@/stores/userStore";
import { useAlert } from "@/contexts/AlertContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  MarksService,
  SubjectsService,
  StudentsService,
  DatabaseService,
} from "@/services";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function MarksPage() {
  const { user } = useUserStore();
  const { showAlert } = useAlert();
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjectMarksData, setSubjectMarksData] = useState<Marks[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (user) {
      loadOptions();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClassId) {
      // refresh students list for selected class
      StudentsService.getStudentsByClass(selectedClassId).then(setStudents);
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedSubjectId && selectedClassId) {
      loadSubjectMarksData();
    }
  }, [selectedSubjectId, selectedClassId]);

  // Refresh marks data when screen comes into focus (e.g., after adding/editing marks)
  useFocusEffect(
    useCallback(() => {
      if (selectedSubjectId && selectedClassId && selectedMonth) {
        loadSubjectMarksData();
      }
    }, [selectedSubjectId, selectedClassId, selectedMonth]),
  );

  const loadOptions = async () => {
    try {
      setLoading(true);
      const [allSubjects, allClasses] = await Promise.all([
        SubjectsService.getAllSubjects(),
        DatabaseService.getAllClasses(),
      ]);
      setSubjects(allSubjects);
      setClasses(
        allClasses.map(cls => ({
          ...cls,
          id: cls.classId || cls.id,
        })) as unknown as Class[],
      );
    } catch (error) {
      console.error("Error loading options:", error);
      showAlert({
        title: "Error",
        message: "Failed to load subjects/classes",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSubjectMarksData = async () => {
    if (!selectedSubjectId || !selectedClassId) return;

    try {
      const allMarks = await MarksService.getSubjectMarksByClass(
        selectedSubjectId,
        selectedClassId,
      );
      setSubjectMarksData(allMarks);
      if (allMarks.length > 0 && !selectedMonth) {
        setSelectedMonth(allMarks[0].month);
      }
    } catch (error) {
      console.error("Error loading class marks data:", error);
      showAlert({
        title: "Error",
        message: "Failed to load class data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading marks...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <Appbar showBack={true} title="Student Marks" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Dropdown
            placeholder="Select Class"
            options={classes.map(c => ({
              id: c.id,
              label: `${c.name} (Grade ${c.grade}${c.section})`,
              value: c.classId || c.id,
            }))}
            selectedValue={selectedClassId}
            onSelect={option => setSelectedClassId(option.value)}
          />
          <Dropdown
            placeholder="Select Subject"
            options={subjects.map(s => ({
              id: s.id,
              label: s.name,
              value: s.id,
            }))}
            selectedValue={selectedSubjectId}
            onSelect={option => setSelectedSubjectId(option.value)}
          />
          <Dropdown
            placeholder="Select Month"
            options={months.map(month => ({
              id: month,
              label: month,
              value: month,
            }))}
            selectedValue={selectedMonth}
            onSelect={option => {
              setSelectedMonth(option.value);
            }}
          />

          {/* Marks List */}
          {selectedSubjectId && selectedClassId && selectedMonth && (
            <MarksList
              marks={subjectMarksData.filter(
                mark => mark.month === selectedMonth,
              )}
              students={students}
              onEditMarks={() => {
                if (selectedSubjectId && selectedClassId && selectedMonth) {
                  navigation.navigate("AddEditMarks", {
                    mode: "edit",
                    subjectId: selectedSubjectId,
                    classId: selectedClassId,
                    month: selectedMonth,
                  });
                }
              }}
            />
          )}

          {/* Action Buttons */}
          {selectedSubjectId && selectedClassId && selectedMonth && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
              >
                <Download size={24} color={colors.onPrimary} />
                <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                  Download
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    borderWidth: 1,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => {
                  if (selectedSubjectId && selectedClassId && selectedMonth) {
                    navigation.navigate("AddEditMarks", {
                      mode: "add",
                      subjectId: selectedSubjectId,
                      classId: selectedClassId,
                      month: selectedMonth,
                    });
                  } else {
                    showAlert({
                      title: "Selection Required",
                      message: "Please select subject, class and month",
                      type: "warning",
                    });
                  }
                }}
              >
                <Plus size={24} color={colors.text} />
                <Text style={[styles.buttonText, { color: colors.text }]}>
                  Add Marks
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },

  button: {
    padding: 12,
    borderRadius: 12,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
});
