import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { palette } from "../../theme/palette";

export function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.line,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFF7F2",
  },
  chipActive: {
    backgroundColor: palette.text,
    borderColor: palette.text,
  },
  label: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "600",
  },
  labelActive: {
    color: "#FFFFFF",
  },
});
