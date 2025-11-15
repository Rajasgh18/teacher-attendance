import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";

import { Modal } from "./Modal";

export interface DropdownOption {
  id: string;
  label: string;
  value: any;
}

interface DropdownProps {
  label?: string;
  placeholder: string;
  options: DropdownOption[];
  selectedValue: any;
  onSelect: (option: DropdownOption) => void;
  disabled?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder,
  options,
  selectedValue,
  onSelect,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === selectedValue);

  const handleSelect = (option: DropdownOption) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: selectedOption ? colors.text : colors.textSecondary,
            },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        {isOpen ? (
          <ChevronUp size={20} color={colors.textSecondary} />
        ) : (
          <ChevronDown size={20} color={colors.textSecondary} />
        )}
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Select ${label || "Option"}`}
      >
        {options.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              {
                borderBottomWidth: options.length - 1 === index ? 0 : 1,
                borderColor: colors.border,
                backgroundColor:
                  selectedValue === item.value
                    ? colors.primary + "20"
                    : "transparent",
              },
            ]}
            onPress={() => handleSelect(item)}
          >
            <Text style={[styles.optionText, { color: colors.text }]}>
              {item.label}
            </Text>
            {selectedValue === item.value && (
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
  container: {
    flex: 1,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  button: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    flex: 1,
  },
  option: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
