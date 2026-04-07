import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { connections, socialPlatforms } from "../../data/mockData";
import { FilterChip } from "../../components/ui/FilterChip";
import { ScreenSurface } from "../../components/ui/ScreenSurface";
import { SectionCard } from "../../components/ui/SectionCard";
import { ConnectionFilter, SocialPlatform } from "../../types";
import { palette } from "../../theme/palette";

const filters: ConnectionFilter[] = ["all", "partner", "friend", "family"];

export function ConnectionsScreen() {
  const [selectedFilter, setSelectedFilter] = useState<ConnectionFilter>("partner");
  const [selectedSocials, setSelectedSocials] = useState<SocialPlatform[]>([
    "Instagram",
    "Spotify",
  ]);

  const filteredConnections = useMemo(
    () =>
      connections.filter((connection) =>
        selectedFilter === "all"
          ? true
          : connection.relationshipType === selectedFilter
      ),
    [selectedFilter]
  );

  const toggleSocial = (platform: SocialPlatform) => {
    setSelectedSocials((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform]
    );
  };

  return (
    <ScreenSurface>
      <SectionCard
        title="Your people"
        subtitle="Invite partners, close friends, siblings, parents, or anyone you want to stay meaningfully connected to"
      >
        <View style={styles.chipWrap}>
          {filters.map((filter) => (
            <FilterChip
              key={filter}
              label={capitalize(filter)}
              active={selectedFilter === filter}
              onPress={() => setSelectedFilter(filter)}
            />
          ))}
        </View>

        {filteredConnections.map((connection) => (
          <View key={connection.id} style={styles.profileCard}>
            <View
              style={[
                styles.avatarLarge,
                {
                  backgroundColor:
                    connection.relationshipType === "partner" ? "#FFD4D8" : palette.sky,
                },
              ]}
            >
              <Text style={styles.avatarInitial}>{connection.name[0]}</Text>
            </View>
            <View style={styles.profileCopy}>
              <Text style={styles.profileName}>{connection.name}</Text>
              <Text style={styles.profileMeta}>
                {capitalize(connection.relationshipType)} | {connection.location}
              </Text>
              <Text style={styles.profileNote}>{connection.note}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Add friend / partner / family member</Text>
        </TouchableOpacity>
      </SectionCard>

      <SectionCard
        title="Connected socials"
        subtitle="Bring familiar context into the relationship space without making outside platforms the main experience"
      >
        <View style={styles.chipWrap}>
          {socialPlatforms.map((platform) => (
            <FilterChip
              key={platform}
              label={platform}
              active={selectedSocials.includes(platform)}
              onPress={() => toggleSocial(platform)}
            />
          ))}
        </View>

        {selectedSocials.map((platform) => (
          <View key={platform} style={styles.feedCard}>
            <View style={styles.socialBadge}>
              <Text style={styles.socialBadgeText}>{platform.slice(0, 1)}</Text>
            </View>
            <View style={styles.feedCopy}>
              <Text style={styles.feedTitle}>{platform} profile linked</Text>
              <Text style={styles.feedMeta}>
                Use this for music, photo context, identity details, and shared
                memories around what you already love.
              </Text>
            </View>
          </View>
        ))}
      </SectionCard>
    </ScreenSurface>
  );
}

function capitalize(value: string) {
  if (value === "friend") {
    return "Friends";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  profileCard: {
    flexDirection: "row",
    gap: 14,
    padding: 14,
    backgroundColor: "#FFF8F2",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.line,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F4E6DF",
  },
  avatarInitial: {
    color: palette.text,
    fontSize: 22,
    fontWeight: "800",
  },
  profileCopy: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "800",
  },
  profileMeta: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  profileNote: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  secondaryButton: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: palette.text,
    fontSize: 14,
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
  socialBadge: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0E6",
    borderWidth: 1,
    borderColor: "#F4E6DF",
  },
  socialBadgeText: {
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
});
