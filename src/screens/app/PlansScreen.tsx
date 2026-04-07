import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { dateIdeas, upcomingVisits } from "../../data/mockData";
import { FilterChip } from "../../components/ui/FilterChip";
import { ScreenSurface } from "../../components/ui/ScreenSurface";
import { SectionCard } from "../../components/ui/SectionCard";
import { palette } from "../../theme/palette";

export function PlansScreen() {
  const [selectedDateIdea, setSelectedDateIdea] = useState(dateIdeas[0]);

  return (
    <ScreenSurface>
      <SectionCard
        title="Date night generator"
        subtitle="Fresh ideas that work across time zones and across different kinds of relationships"
      >
        <Text style={styles.promptText}>{selectedDateIdea}</Text>
        <View style={styles.chipWrap}>
          {dateIdeas.map((idea) => (
            <FilterChip
              key={idea}
              label={idea}
              active={selectedDateIdea === idea}
              onPress={() => setSelectedDateIdea(idea)}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Save as a shared plan</Text>
        </TouchableOpacity>
      </SectionCard>

      <SectionCard
        title="Next visit countdown"
        subtitle="Make time together feel tangible"
      >
        {upcomingVisits.map((visit) => (
          <View key={visit.title} style={styles.visitCard}>
            <View style={styles.visitBadge}>
              <Text style={styles.visitNumber}>{visit.daysAway}</Text>
              <Text style={styles.visitBadgeLabel}>days</Text>
            </View>
            <View style={styles.visitCopy}>
              <Text style={styles.feedTitle}>{visit.title}</Text>
              <Text style={styles.feedMeta}>
                {visit.date} | {visit.location}
              </Text>
              <Text style={styles.feedMeta}>{visit.plan}</Text>
            </View>
          </View>
        ))}
      </SectionCard>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  promptText: {
    color: palette.text,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "700",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  primaryButton: {
    backgroundColor: palette.text,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  visitCard: {
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
    backgroundColor: palette.softSun,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#F1E3C8",
  },
  visitBadge: {
    width: 78,
    minHeight: 78,
    borderRadius: 22,
    backgroundColor: "#FFFDF8",
    borderWidth: 1,
    borderColor: "#EFDDB7",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  visitNumber: {
    color: palette.text,
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 36,
  },
  visitBadgeLabel: {
    color: palette.berry,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  visitCopy: {
    flex: 1,
    gap: 6,
    paddingTop: 2,
  },
  feedTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "800",
  },
  feedMeta: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
