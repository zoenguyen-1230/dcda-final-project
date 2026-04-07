import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  calendarEvents,
  journalEntries,
  timeCapsules,
} from "../../data/mockData";
import { ScreenSurface } from "../../components/ui/ScreenSurface";
import { SectionCard } from "../../components/ui/SectionCard";
import { palette } from "../../theme/palette";

export function SharedScreen() {
  return (
    <ScreenSurface>
      <SectionCard
        title="Shared journal"
        subtitle="Capture the moments that matter, not just the messages you send"
      >
        {journalEntries.map((entry) => (
          <View key={entry.id} style={styles.timelineCard}>
            <View style={styles.timelineHeader}>
              <View style={styles.timelineBadge}>
                <Text style={styles.timelineMonth}>{entry.date.split(" ")[0].slice(0, 3).toUpperCase()}</Text>
                <Text style={styles.timelineDay}>{entry.date.split(" ")[1]}</Text>
              </View>
              <View style={styles.timelineCopy}>
                <Text style={styles.timelineTitle}>{entry.title}</Text>
                <Text style={styles.timelineBody}>{entry.body}</Text>
              </View>
            </View>
          </View>
        ))}
      </SectionCard>

      <SectionCard
        title="Time capsule"
        subtitle="Leave something meaningful for later"
      >
        {timeCapsules.map((capsule) => (
          <View key={capsule.id} style={styles.feedCard}>
            <View style={styles.capsuleBadge}>
              <Text style={styles.capsuleBadgeText}>TC</Text>
            </View>
            <View style={styles.feedCopy}>
              <Text style={styles.feedTitle}>{capsule.title}</Text>
              <Text style={styles.feedMeta}>
                Opens on {capsule.unlockDate} | From {capsule.from}
              </Text>
            </View>
          </View>
        ))}
      </SectionCard>

      <SectionCard
        title="Shared calendar"
        subtitle="Stay aligned on rituals, travel, birthdays, and intentional time together"
      >
        {calendarEvents.map((event) => (
          <View key={event.id} style={styles.calendarRow}>
            <View style={styles.calendarDate}>
              <Text style={styles.calendarDateMonth}>{event.month}</Text>
              <Text style={styles.calendarDateDay}>{event.day}</Text>
            </View>
            <View style={styles.feedCopy}>
              <Text style={styles.feedTitle}>{event.title}</Text>
              <Text style={styles.feedMeta}>{event.detail}</Text>
            </View>
          </View>
        ))}
      </SectionCard>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  timelineCard: {
    backgroundColor: "#FFF8F2",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
  },
  timelineHeader: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  timelineBadge: {
    width: 60,
    borderRadius: 18,
    backgroundColor: "#FFF1E7",
    borderWidth: 1,
    borderColor: "#F4E6DF",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  timelineCopy: {
    flex: 1,
    gap: 6,
  },
  timelineMonth: {
    color: palette.berry,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  timelineDay: {
    color: palette.text,
    fontSize: 24,
    fontWeight: "800",
  },
  timelineTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "800",
  },
  timelineBody: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  feedCard: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
    backgroundColor: "#FFF8F2",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 14,
  },
  capsuleBadge: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.lavender,
    borderWidth: 1,
    borderColor: "#E6D6F3",
  },
  capsuleBadgeText: {
    color: palette.text,
    fontWeight: "700",
    fontSize: 12,
  },
  feedCopy: {
    flex: 1,
    gap: 3,
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
  calendarRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    backgroundColor: "#FFF8F2",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 14,
  },
  calendarDate: {
    width: 60,
    borderRadius: 18,
    backgroundColor: "#FFF1E7",
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F4E6DF",
  },
  calendarDateMonth: {
    color: palette.berry,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  calendarDateDay: {
    color: palette.text,
    fontSize: 24,
    fontWeight: "800",
  },
});
