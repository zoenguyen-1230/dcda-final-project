import React from "react";
import { ScrollView, StyleSheet, ViewStyle } from "react-native";

export const ScreenSurface = React.forwardRef<
  ScrollView,
  {
    children: React.ReactNode;
    contentContainerStyle?: ViewStyle;
  }
>(function ScreenSurface({ children, contentContainerStyle }, ref) {
  return (
    <ScrollView
      ref={ref}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.content, contentContainerStyle]}
    >
      {children}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },
});
