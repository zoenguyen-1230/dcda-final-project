import React, {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { hasSupabaseCredentials } from "../config/env";
import { readBrowserStorage, writeBrowserStorage } from "../lib/browserStorage";
import { CalendarProvider, CurrentUserProfile, SocialPlatform } from "../types";
import { loadWorkspaceState, saveWorkspaceProfile } from "../lib/workspaceState";
import { useAuth } from "./AuthProvider";

interface ProfileContextValue {
  initialized: boolean;
  profile: CurrentUserProfile;
  saveProfile: (nextProfile: CurrentUserProfile) => Promise<void>;
}

const defaultLinkedSocials: SocialPlatform[] = [];
const defaultConnectedCalendars: CalendarProvider[] = [];

function getProfileStorageKey(userEmail: string | null) {
  return userEmail ? `same-time-profile:${userEmail}` : null;
}

function hasMeaningfulProfileData(profile: Partial<CurrentUserProfile> | null | undefined) {
  if (!profile) {
    return false;
  }

  return Boolean(
    profile.displayName ||
      profile.location ||
      profile.timezone ||
      profile.relationshipFocus ||
      profile.note ||
      profile.photoUri ||
      (Array.isArray(profile.connectedCalendars) && profile.connectedCalendars.length) ||
      (Array.isArray(profile.linkedSocials) && profile.linkedSocials.length)
  );
}

function buildDefaultProfile(
  userEmail: string | null,
  displayName: string | null
): CurrentUserProfile {
  return {
    displayName: displayName || userEmail?.split("@")[0] || "You",
    location: "",
    timezone: "",
    relationshipFocus: "",
    note: "",
    linkedSocials: defaultLinkedSocials,
    connectedCalendars: defaultConnectedCalendars,
    photoUri: "",
  };
}

function mergeProfileSources(
  defaultProfile: CurrentUserProfile,
  workspaceProfile: Partial<CurrentUserProfile> | null | undefined,
  localProfile: Partial<CurrentUserProfile> | null | undefined
): CurrentUserProfile {
  const pickString = (...values: Array<unknown>) => {
    for (const value of values) {
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }

    return "";
  };

  const pickArray = <T,>(...values: Array<unknown>) => {
    for (const value of values) {
      if (Array.isArray(value)) {
        return value as T[];
      }
    }

    return [] as T[];
  };

  return {
    displayName:
      pickString(localProfile?.displayName, workspaceProfile?.displayName, defaultProfile.displayName) ||
      defaultProfile.displayName,
    location: pickString(localProfile?.location, workspaceProfile?.location, defaultProfile.location),
    timezone: pickString(localProfile?.timezone, workspaceProfile?.timezone, defaultProfile.timezone),
    relationshipFocus: pickString(
      localProfile?.relationshipFocus,
      workspaceProfile?.relationshipFocus,
      defaultProfile.relationshipFocus
    ),
    note: pickString(localProfile?.note, workspaceProfile?.note, defaultProfile.note),
    linkedSocials: pickArray<SocialPlatform>(
      localProfile?.linkedSocials,
      workspaceProfile?.linkedSocials,
      defaultProfile.linkedSocials
    ),
    connectedCalendars: pickArray<CalendarProvider>(
      localProfile?.connectedCalendars,
      workspaceProfile?.connectedCalendars,
      defaultProfile.connectedCalendars
    ),
    photoUri: pickString(localProfile?.photoUri, workspaceProfile?.photoUri, defaultProfile.photoUri) || "",
  };
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, userEmail, displayName, previewMode } = useAuth();
  const shouldUseSupabaseProfile = Boolean(user?.id && hasSupabaseCredentials && !previewMode);
  const storageKey = getProfileStorageKey(userEmail);
  const [initialized, setInitialized] = useState(false);
  const [profile, setProfile] = useState<CurrentUserProfile>(
    buildDefaultProfile(userEmail, displayName)
  );

  useEffect(() => {
    const loadProfile = async () => {
      if (!userEmail) {
        startTransition(() => {
          setProfile(buildDefaultProfile(userEmail, displayName));
          setInitialized(true);
        });
        return;
      }

      setInitialized(false);

      try {
        if (shouldUseSupabaseProfile && user?.id) {
          const defaultProfile = buildDefaultProfile(userEmail, displayName);
          const browserSavedValue = readBrowserStorage(storageKey);
          const [workspace, savedValue] = await Promise.all([
            loadWorkspaceState(user.id),
            storageKey ? AsyncStorage.getItem(storageKey) : Promise.resolve(null),
          ]);
          const localSavedProfile = browserSavedValue
            ? (JSON.parse(browserSavedValue) as Partial<CurrentUserProfile>)
            : savedValue
              ? (JSON.parse(savedValue) as Partial<CurrentUserProfile>)
              : null;
          const workspaceProfile = hasMeaningfulProfileData(workspace?.profile_data)
            ? workspace?.profile_data
            : null;
          const savedProfile = mergeProfileSources(
            defaultProfile,
            workspaceProfile,
            localSavedProfile
          );

          startTransition(() => {
            setProfile(savedProfile);
            setInitialized(true);
          });
          return;
        }

        if (shouldUseSupabaseProfile) {
          startTransition(() => {
            setProfile(buildDefaultProfile(userEmail, displayName));
            setInitialized(true);
          });
          return;
        }

        const fallbackStorageKey = `same-time-profile:${userEmail}`;
        const savedValue = await AsyncStorage.getItem(fallbackStorageKey);
        const defaultProfile = buildDefaultProfile(userEmail, displayName);

        if (savedValue) {
          const savedProfile = JSON.parse(savedValue) as Partial<CurrentUserProfile>;

          startTransition(() => {
            setProfile(mergeProfileSources(defaultProfile, null, savedProfile));
            setInitialized(true);
          });
          return;
        }

        startTransition(() => {
          setProfile(defaultProfile);
          setInitialized(true);
        });
      } catch {
        startTransition(() => {
          setProfile(buildDefaultProfile(userEmail, displayName));
          setInitialized(true);
        });
      }
    };

    void loadProfile();
  }, [displayName, shouldUseSupabaseProfile, storageKey, user?.id, userEmail]);

  const saveProfile = async (nextProfile: CurrentUserProfile) => {
    startTransition(() => {
      setProfile(nextProfile);
    });

    if (storageKey) {
      writeBrowserStorage(storageKey, JSON.stringify(nextProfile));
      await AsyncStorage.setItem(storageKey, JSON.stringify(nextProfile));
    }

    if (shouldUseSupabaseProfile && user?.id) {
      await saveWorkspaceProfile(user.id, nextProfile);
      return;
    }

    if (!storageKey) {
      return;
    }
  };

  const value = useMemo<ProfileContextValue>(
    () => ({
      initialized,
      profile,
      saveProfile,
    }),
    [initialized, profile]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const value = useContext(ProfileContext);

  if (!value) {
    throw new Error("useProfile must be used inside ProfileProvider");
  }

  return value;
}
