import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { palette } from "../../theme/palette";

export function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.line,
  },
  title: {
    color: palette.text,
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  body: {
    marginTop: 14,
    gap: 14,
  },
});
