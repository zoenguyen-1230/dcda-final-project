import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MetricCard } from "../../components/ui/MetricCard";
import { FilterChip } from "../../components/ui/FilterChip";
import { ScreenSurface } from "../../components/ui/ScreenSurface";
import { SectionCard } from "../../components/ui/SectionCard";
import { moodUpdates, nextVisit, promptDeck } from "../../data/mockData";
import { useAuth } from "../../providers/AuthProvider";
import { palette } from "../../theme/palette";

export function HomeScreen() {
  const { displayName, userEmail, isDemoMode } = useAuth();
  const [selectedPrompt, setSelectedPrompt] = useState(promptDeck[0]);

  return (
    <ScreenSurface>
      <LinearGradient
        colors={[palette.softRose, palette.softSun]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <Text style={styles.bannerEyebrow}>
          {isDemoMode ? "Prototype mode" : "Live account"}
        </Text>
        <Text style={styles.bannerTitle}>
          Welcome back, {displayName || userEmail?.split("@")[0] || "friend"}.
        </Text>
        <Text style={styles.bannerBody}>
          {nextVisit.daysAway} days until your next time together in {nextVisit.location}.
        </Text>
      </LinearGradient>

      <View style={styles.metricRow}>
        <MetricCard label="Streak" value="14 days" accent={palette.coral} />
        <MetricCard label="Shared entries" value="42" accent={palette.teal} />
        <MetricCard label="Pending capsules" value="3" accent={palette.berry} />
      </View>

      <SectionCard
        title="Daily check-in prompt"
        subtitle="A small ritual for intentional connection"
      >
        <Text style={styles.promptText}>{selectedPrompt}</Text>
        <View style={styles.chipWrap}>
          {promptDeck.map((prompt) => (
            <FilterChip
              key={prompt}
              label={prompt}
              active={selectedPrompt === prompt}
              onPress={() => setSelectedPrompt(prompt)}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Send prompt to your circle</Text>
        </TouchableOpacity>
      </SectionCard>

      <SectionCard
        title="Mood sharing"
        subtitle="Quick emotional and wellness updates from your people"
      >
        {moodUpdates.map((mood) => (
          <View key={mood.id} style={styles.feedCard}>
            <View style={[styles.avatarBadge, { backgroundColor: mood.color }]}>
              <Text style={styles.avatarLabel}>{mood.name[0]}</Text>
            </View>
            <View style={styles.feedCopy}>
              <Text style={styles.feedTitle}>{mood.name} feels {mood.mood}</Text>
              <Text style={styles.feedMeta}>
                Energy: {mood.energy} | Health: {mood.health}
              </Text>
              <Text style={styles.feedSubtle}>{mood.updatedAt}</Text>
            </View>
          </View>
        ))}
      </SectionCard>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 28,
    padding: 22,
    gap: 8,
  },
  bannerEyebrow: {
    color: palette.berry,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  bannerTitle: {
    color: palette.text,
    fontSize: 28,
    fontWeight: "800",
  },
  bannerBody: {
    color: palette.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  metricRow: {
    flexDirection: "row",
    gap: 10,
  },
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
  avatarBadge: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F4E6DF",
  },
  avatarLabel: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "800",
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
  feedSubtle: {
    color: palette.berry,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
