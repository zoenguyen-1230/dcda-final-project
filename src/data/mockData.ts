import {
  CalendarEvent,
  Connection,
  JournalEntry,
  Message,
  MoodUpdate,
  SocialPlatform,
  TimeCapsule,
  VisitPlan,
} from "../types";

export const socialPlatforms: SocialPlatform[] = [
  "Instagram",
  "Spotify",
  "TikTok",
  "Facebook",
  "X",
  "BeReal",
];

export const connections: Connection[] = [
  {
    id: "conn-1",
    name: "Sean",
    relationshipType: "partner",
    location: "San Francisco, CA",
    note: "Sends a good morning text every morning before class.",
  },
  {
    id: "conn-2",
    name: "Trang",
    relationshipType: "friend",
    location: "Hanoi, VN",
    note: "Plays Buzzfeed and listens to GREY D's latest album release.",
  },
  {
    id: "conn-4",
    name: "Phuc",
    relationshipType: "friend",
    location: "Washington, DC",
    note: "Fall trip to DC",
  },
  {
    id: "conn-5",
    name: "Julie",
    relationshipType: "friend",
    location: "New York, NY",
    note: "Catches up with Julie during NYC April trip.",
  },
  {
    id: "conn-3",
    name: "Hien",
    relationshipType: "family",
    location: "Hanoi, VN",
    note: "Calls Mom for daily updates at 7 pm.",
  },
];

export const conversations: Message[] = [
  {
    id: "msg-1",
    from: "Sean",
    type: "Text",
    body: "Happy Tue's Day Tuesday",
    sentAt: "8:12 AM",
  },
  {
    id: "msg-2",
    from: "You",
    type: "Text",
    body: "Saving that spot for our Austin trip. I also added Wednesday FaceTime to the shared calendar.",
    sentAt: "8:25 AM",
  },
  {
    id: "msg-3",
    from: "Sean",
    type: "Photo",
    body: "Photo drop: Yogurt bowl and banana for breakfast baby",
    sentAt: "8:31 AM",
  },
  {
    id: "msg-4",
    from: "You",
    type: "Video message",
    body: "Recorded a quick update from Dallas so it feels like you were here.",
    sentAt: "9:04 AM",
  },
];

export const promptDeck = [
  "What made you feel most seen today?",
  "How was your day, really?",
  "What's one small thing I can do for you from afar this week?",
  "What memory are you replaying lately?",
];

export const journalEntries: JournalEntry[] = [
  {
    id: "journal-1",
    date: "March 29",
    title: "Homecook Night",
    body: "We cooked sisig and Vietnamese thit rang chay canh at home while playing music and watching You've Got Mail.",
  },
  {
    id: "journal-2",
    date: "March 28",
    title: "Fort Worth Date",
    body: "We grabbed coffee at Ampersand, walked to Kimbell Art Museum and discussed about art, life, and future. Then we had lunch at Terry Black's Barbecue, did window shopping at Urban Outfitters, strolled around Fort Worth Botanic Garden, did grocery shopping at Target, and ended the night with sashimi and handrolls at Hatsuyuki Handroll Bar.",
  },
];

export const moodUpdates: MoodUpdate[] = [
  {
    id: "mood-1",
    name: "Sean",
    mood: "hopeful",
    energy: "steady",
    health: "slept well",
    updatedAt: "Updated 20 min ago",
    color: "#FFD8DE",
  },
  {
    id: "mood-2",
    name: "Trang",
    mood: "stretched thin",
    energy: "low",
    health: "needs a break",
    updatedAt: "Updated 1 hr ago",
    color: "#DDF2FF",
  },
];

export const timeCapsules: TimeCapsule[] = [
  {
    id: "capsule-1",
    title: "Open this on our 6 month mark",
    from: "You",
    unlockDate: "September 17, 2026",
  },
  {
    id: "capsule-2",
    title: "For the next hard day",
    from: "Sean",
    unlockDate: "Unlock anytime with permission",
  },
];

export const calendarEvents: CalendarEvent[] = [
  {
    id: "event-1",
    month: "APR",
    day: "12",
    title: "Sunday check-in ritual",
    detail: "9:00 PM CT | Big Sur trip/NFL in Dallas updates + photo recap + mood share",
  },
  {
    id: "event-2",
    month: "APR",
    day: "24",
    title: "Weekend trip to Austin, TX",
    detail: "Austin | Try new cuisine + picnic date + sightseeing",
  },
  {
    id: "event-3",
    month: "MAY",
    day: "18",
    title: "Family visit to San Francisco, CA",
    detail: "San Francisco | Family dinner",
  },
];

export const nextVisit: VisitPlan = {
  title: "Fort Worth time together",
  date: "April 20, 2026",
  location: "Fort Worth, Texas",
  daysAway: 13,
  plan: "Shared checklist: arrival details set, favorite spots saved, and time together protected.",
};

export const upcomingVisits: VisitPlan[] = [
  nextVisit,
  {
    title: "San Francisco time together",
    date: "May 18, 2026",
    location: "San Francisco, CA",
    daysAway: 41,
    plan: "Shared checklist: museum, family dinner, airport drop-off, Yosemite weekend trip.",
  },
  {
    title: "New York City time together",
    date: "June 12, 2026",
    location: "New York, NY",
    daysAway: 66,
    plan: "Shared checklist: IKEA date, boat rowing date at Central Park, Chinatown food crawl, West Village date.",
  },
];

export const dateIdeas = [
  "Cook the same comfort meal and rate each plate like a tiny food show.",
  "Trade voice memos telling the story behind one old photo each.",
  "Build a shared playlist, then journal one memory each song unlocks.",
  "Plan a dream day in the city you'll visit next and save it to the calendar.",
];

export const composerActions = [
  "Type a message",
  "Send photo",
  "Voice memo",
  "Video message",
];
