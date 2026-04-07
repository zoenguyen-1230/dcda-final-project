export type RelationshipType = "partner" | "friend" | "family";

export type ConnectionFilter = "all" | RelationshipType;

export type SocialPlatform =
  | "Instagram"
  | "Spotify"
  | "TikTok"
  | "Facebook"
  | "X"
  | "BeReal";

export type AppTabParamList = {
  Home: undefined;
  People: undefined;
  Chat: undefined;
  Shared: undefined;
  Plans: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export interface Connection {
  id: string;
  name: string;
  relationshipType: RelationshipType;
  location: string;
  note: string;
}

export interface Message {
  id: string;
  from: string;
  type: "Text" | "Photo" | "Voice memo" | "Video message";
  body: string;
  sentAt: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  body: string;
}

export interface MoodUpdate {
  id: string;
  name: string;
  mood: string;
  energy: string;
  health: string;
  updatedAt: string;
  color: string;
}

export interface TimeCapsule {
  id: string;
  title: string;
  from: string;
  unlockDate: string;
}

export interface CalendarEvent {
  id: string;
  month: string;
  day: string;
  title: string;
  detail: string;
}

export interface VisitPlan {
  title: string;
  date: string;
  location: string;
  daysAway: number;
  plan: string;
}
