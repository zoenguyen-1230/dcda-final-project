import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { palette } from "../../theme/palette";

export function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <View style={[styles.card, { borderTopColor: accent }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
    borderTopWidth: 4,
    gap: 10,
  },
  label: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  value: {
    color: palette.text,
    fontSize: 22,
    fontWeight: "800",
  },
});
