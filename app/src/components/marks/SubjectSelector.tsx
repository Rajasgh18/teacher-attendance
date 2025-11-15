import React, { useState } from "react";
import { ChevronDown } from "lucide-react-native";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { Subject } from "@/types";
import { Modal } from "@/components/Modal";
import { useTheme } from "@/contexts/ThemeContext";

interface SubjectSelectorProps {
  subjects: Subject[];
  selectedSubject: Subject | null;
  onSubjectSelect: (subject: Subject) => void;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  subjects,
  selectedSubject,
  onSubjectSelect,
}) => {
  const { colors } = useTheme();
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.selectorButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
        onPress={() => setShowSubjectSelector(true)}
      >
        <Text
          style={[
            styles.selectorText,
            {
              color: selectedSubject ? colors.text : colors.textSecondary,
            },
          ]}
        >
          {selectedSubject?.name || "Select Subject"}
        </Text>
        <ChevronDown size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Subject Selection Modal */}
      <Modal
        visible={showSubjectSelector}
        onClose={() => setShowSubjectSelector(false)}
        title="Select Subject"
      >
        {subjects.map((subject, index) => (
          <TouchableOpacity
            key={subject.id}
            style={[
              styles.modalOption,
              {
                borderBottomWidth: subjects.length - 1 === index ? 0 : 1,
                borderColor: colors.border,
              },
            ]}
            onPress={() => {
              onSubjectSelect(subject);
              setShowSubjectSelector(false);
            }}
          >
            <Text style={[styles.modalOptionText, { color: colors.text }]}>
              {subject.name}
            </Text>
            {selectedSubject?.id === subject.id && (
              <View
                style={[
                  styles.selectedIndicator,
                  { backgroundColor: colors.primary },
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 56,
  },
  selectorText: {
    fontSize: 16,
    flex: 1,
  },
  modalOption: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalOptionText: {
    fontSize: 16,
    flex: 1,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
