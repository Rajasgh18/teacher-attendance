import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Save } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  MarksService,
  SubjectsService,
  StudentsService,
  DatabaseService,
} from "@/services";
import { Subject, Student } from "@/types";
import { Appbar } from "@/components/appbar";
import { Dropdown } from "@/components/Dropdown";
import { useUserStore } from "@/stores/userStore";
import { useAlert } from "@/contexts/AlertContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { StudentMarksInput } from "@/components/StudentMarksInput";
import { useNavigation, useRouteParams } from "@/navigation";

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

export default function AddEditMarksScreen() {
  const navigation = useNavigation();
  const routeParams = useRouteParams<"AddEditMarks">();
  const { mode, subjectId, classId, month } = routeParams || {};
  const { showAlert } = useAlert();
  const { colors } = useTheme();
  const { user } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [formMarks, setFormMarks] = useState<{ [key: string]: number }>({});
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (subjectId) {
      loadData();
    }
  }, [subjectId]);

  // Ensure we have required params and then load data
  useEffect(() => {
    if (subjectId && classId) {
      loadData();
    }
  }, [subjectId, classId]);

  // Set month from route params if editing
  useEffect(() => {
    if (mode === "edit" && month) {
      setSelectedMonth(month);
    } else if (mode === "add" && !selectedMonth) {
      // Set current month as default for add mode
      const currentMonth = new Date().toLocaleString("default", {
        month: "long",
      });
      setSelectedMonth(currentMonth);
    }
  }, [mode, month, selectedMonth]);

  const loadData = async () => {
    if (!subjectId || !classId) return;
    try {
      setLoading(true);

      // Get the subject details
      const subjectData = await SubjectsService.getSubjectById(subjectId);
      if (!subjectData) {
        showAlert({
          title: "Subject Not Found",
          message: "The selected subject could not be found.",
          type: "error",
        });
        return;
      }
      setSubject(subjectData);

      // Get class information from route params (required)
      const classData = await DatabaseService.getClassByClassId(classId);
      const classIdToUse: string = classId;

      if (!classData) {
        showAlert({
          title: "Class Not Found",
          message:
            "The assigned class could not be found. Please contact your administrator.",
          type: "error",
        });
        return;
      }
      setClassInfo({
        id: classData.id || classData.classId,
        name: classData.name,
        grade: classData.grade,
        section: classData.section,
      });

      // Get students for the assigned class
      const studentsData = await StudentsService.getStudentsByClass(
        classIdToUse,
      );
      if (studentsData.length === 0) {
        showAlert({
          title: "No Students",
          message:
            "No students found in the assigned class. Please contact your administrator.",
          type: "warning",
        });
      }
      setStudents(studentsData);

      // Initialize formMarks with default values for all students
      const initialMarks: { [key: string]: number } = {};
      studentsData.forEach(student => {
        initialMarks[student.studentId] = 0;
      });

      // If editing mode, load existing marks and update formMarks
      if (mode === "edit" && month) {
        const marks = await MarksService.getSubjectMarksByClass(
          subjectId,
          classIdToUse,
          month,
        );

        // Update formMarks with existing data
        marks.forEach(mark => {
          if (
            Object.prototype.hasOwnProperty.call(initialMarks, mark.studentId)
          ) {
            initialMarks[mark.studentId] = mark.marks;
          }
        });
      }

      // Always set formMarks (for both add and edit modes)
      setFormMarks(initialMarks);
    } catch (error) {
      console.error("Error loading data:", error);
      showAlert({
        title: "Error",
        message: "Failed to load data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (studentId: string, marks: number) => {
    // Validate marks range (0-100)
    if (marks < 0 || marks > 100) {
      showAlert({
        title: "Invalid Marks",
        message: "Marks must be between 0 and 100",
        type: "error",
      });
      return;
    }

    setFormMarks(prev => ({
      ...prev,
      [studentId]: marks,
    }));
  };

  const handleSave = async () => {
    if (!subject || !selectedMonth || !classInfo) {
      showAlert({
        title: "Validation Error",
        message: "Please ensure subject, class, and month are selected",
        type: "error",
      });
      return;
    }

    // Check if all students have marks entered (0 is valid, undefined is not)
    const studentsWithoutMarks = students.filter(
      student => formMarks[student.studentId] === undefined,
    );

    if (studentsWithoutMarks.length > 0) {
      showAlert({
        title: "Validation Error",
        message: `Please enter marks for all students: ${studentsWithoutMarks
          .map(s => `${s.firstName} ${s.lastName}`)
          .join(", ")}`,
        type: "error",
      });
      return;
    }

    // Validate that all marks are within valid range (0-100)
    const invalidMarks = students.filter(student => {
      const marks = formMarks[student.studentId];
      return marks < 0 || marks > 100;
    });

    if (invalidMarks && invalidMarks.length > 0) {
      showAlert({
        title: "Validation Error",
        message: `Invalid marks found for: ${invalidMarks
          .map(s => `${s.firstName} ${s.lastName}`)
          .join(", ")}. Marks must be between 0 and 100.`,
        type: "error",
      });
      return;
    }

    try {
      // Check if we're editing existing marks or adding new ones
      if (mode === "edit") {
        // Get existing marks to check what needs to be updated
        const existingMarks = await MarksService.getSubjectMarksByClass(
          subject.id,
          classId || classInfo?.id || "",
          selectedMonth,
        );

        if (existingMarks.length > 0) {
          // Update existing marks
          for (const [studentId, marks] of Object.entries(formMarks)) {
            const existingMark = existingMarks.find(
              mark => mark.studentId === studentId,
            );

            if (existingMark) {
              await MarksService.updateMarks(existingMark.id, { marks });
            }
          }
        } else {
          // No existing marks for this month, add new ones
          const marksToAdd = Object.entries(formMarks).map(
            ([studentId, marks]) => ({
              subjectId: subject.id,
              studentId,
              marks: marks as number,
              month: selectedMonth,
            }),
          );
          for (const markData of marksToAdd) {
            await MarksService.addMarks(markData);
          }
        }
      } else {
        const marksToAdd = Object.entries(formMarks).map(
          ([studentId, marks]) => ({
            subjectId: subject.id,
            studentId,
            marks: marks as number,
            month: selectedMonth,
          }),
        );

        for (const markData of marksToAdd) {
          await MarksService.addMarks(markData);
        }
      }

      const isEditing = mode === "edit";
      showAlert({
        title: "Success",
        message: isEditing
          ? "Marks updated successfully"
          : "Marks added successfully",
        type: "success",
        buttons: [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ],
      });
    } catch (error) {
      console.error("Error saving marks:", error);
      showAlert({
        title: "Error",
        message: "Failed to save marks",
        type: "error",
      });
    }
  };

  const monthOptions = months.map((m, index) => ({
    id: index.toString(),
    label: m,
    value: m,
  }));

  // Filter month options based on mode
  const availableMonthOptions =
    mode === "edit" && month
      ? monthOptions.filter(option => option.value === month)
      : monthOptions;

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading...
        </Text>
      </View>
    );
  }

  // Check if route params are valid
  if (!routeParams || !mode || !subjectId) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: colors.text }]}>
          Invalid route parameters
        </Text>
      </View>
    );
  }

  if (!subject || !classInfo || students.length === 0) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: colors.text }]}>
          Missing required data. Please ensure subject, class, and students are
          loaded.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <Appbar
          showBack={true}
          title={mode === "add" ? "Add Marks" : "Edit Marks"}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {subject && classInfo && students.length > 0 && (
            <>
              {/* Subject and Class Info */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Subject and Class Information
                </Text>
                <View
                  style={[
                    styles.classInfoCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.className, { color: colors.text }]}>
                    {subject.name}
                  </Text>
                  <Text
                    style={[
                      styles.classDetails,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {classInfo.name} • {classInfo.grade} {classInfo.section}
                  </Text>
                  <Text
                    style={[
                      styles.classDetails,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {students.length} students
                  </Text>
                </View>
              </View>

              {/* Month Selection */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {mode === "edit" ? "Month" : "Select Month"}
                </Text>
                {mode === "edit" ? (
                  <View
                    style={[
                      styles.monthDisplay,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.monthText, { color: colors.text }]}>
                      {selectedMonth}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.monthDropdownContainer}>
                    <Dropdown
                      placeholder="Select Month"
                      options={availableMonthOptions}
                      selectedValue={selectedMonth}
                      onSelect={option => {
                        setSelectedMonth(option.value);
                      }}
                    />
                  </View>
                )}
              </View>

              {/* Student Marks Input */}
              {subject && selectedMonth && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Enter Marks for Students
                  </Text>

                  {students.map(student => (
                    <StudentMarksInput
                      key={student.studentId}
                      student={student}
                      marks={formMarks[student.studentId] || 0}
                      onMarksChange={handleMarksChange}
                    />
                  ))}

                  {/* Save Button */}
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      {
                        backgroundColor: colors.primary,
                      },
                    ]}
                    onPress={() => setShowConfirmation(true)}
                  >
                    <View style={styles.saveButtonContent}>
                      <Save size={20} color={colors.onPrimary} />
                      <Text
                        style={[
                          styles.saveButtonText,
                          { color: colors.onPrimary },
                        ]}
                      >
                        {mode === "add" ? "Save Marks" : "Update Marks"}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.saveButtonSubtext,
                        { color: colors.onPrimary + "80" },
                      ]}
                    >
                      {students.length} students
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Confirmation Dialog */}
        {subject && (
          <ConfirmationDialog
            visible={showConfirmation}
            onClose={() => setShowConfirmation(false)}
            onConfirm={handleSave}
            title="Confirm Action"
            message={`Are you sure you want to ${
              mode === "add" ? "save" : "update"
            } marks for ${subject.name} in ${classInfo.name} (${
              classInfo.grade
            }${classInfo.section}) for ${selectedMonth}?`}
            subMessage={`This will affect ${students.length} students.`}
            confirmText={mode === "add" ? "Save" : "Update"}
            type="info"
          />
        )}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  classInfoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  className: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  classDetails: {
    fontSize: 14,
  },
  monthDropdownContainer: {
    flex: 1,
    alignItems: "center",
  },
  monthDisplay: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  monthText: {
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  saveButtonSubtext: {
    fontSize: 12,
  },
});
