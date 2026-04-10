import {
  BudgetItem,
  FlightWindow,
  ItineraryItem,
  PackingItem,
  VisitPlan,
} from "../types";
import { supabase } from "./supabase";
import { buildSharedConnectionId, parseSharedConnectionId } from "./sharedRelationships";

function getDaysAway(dateValue: string) {
  const tripDate = new Date(`${dateValue}T12:00:00`);
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    12,
    0,
    0
  );

  return Math.max(
    0,
    Math.ceil((tripDate.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24))
  );
}

async function fetchRelationshipPeers(userId: string) {
  const { data: memberships, error: membershipError } = await supabase
    .from("relationship_members")
    .select("relationship_id")
    .eq("profile_id", userId);

  if (membershipError) {
    throw membershipError;
  }

  const relationshipIds = Array.from(
    new Set((memberships ?? []).map((membership) => membership.relationship_id).filter(Boolean))
  );

  if (!relationshipIds.length) {
    return new Map<string, string>();
  }

  const { data: members, error: memberError } = await supabase
    .from("relationship_members")
    .select("relationship_id, profile_id")
    .in("relationship_id", relationshipIds);

  if (memberError) {
    throw memberError;
  }

  const peerByRelationshipId = new Map<string, string>();
  (members ?? []).forEach((member) => {
    if (member.profile_id !== userId) {
      peerByRelationshipId.set(member.relationship_id, member.profile_id);
    }
  });

  return peerByRelationshipId;
}

function buildRemoteToolkitId(
  kind: "itinerary" | "flight-window" | "packing" | "budget",
  visitId: string,
  rawId: string
) {
  return `remote-${kind}-${visitId}-${rawId}`;
}

function stripRemoteToolkitId(
  kind: "itinerary" | "flight-window" | "packing" | "budget",
  visitId: string,
  value: string
) {
  const prefix = `remote-${kind}-${visitId}-`;

  if (value.startsWith(prefix)) {
    return value.slice(prefix.length);
  }

  return value;
}

interface SharedTripChecklistPayload {
  title: string;
  plan: string;
  itineraryItems: Array<{
    id: string;
    dateValue?: string;
    startTime?: string;
    endTime?: string;
    time: string;
    title: string;
    detail: string;
  }>;
  completedItinerary: string[];
  flightWindows: Array<{
    id: string;
    startDate: string;
    endDate?: string;
    price?: number;
    note?: string;
  }>;
  packingItems: Array<{
    id: string;
    label: string;
  }>;
  packedItems: string[];
  budgetItems: Array<{
    id: string;
    label: string;
    amount: number;
    category: string;
    payer: string;
  }>;
  budgetClosed: boolean;
}

function extractChecklistMetadata(checklist: unknown): SharedTripChecklistPayload {
  const list = Array.isArray(checklist) ? checklist : [];
  const record =
    list.find((item) => item && typeof item === "object" && ("title" in item || "plan" in item)) ??
    {};
  const title = typeof record === "object" && record && "title" in record ? record.title : "Shared trip";
  const plan = typeof record === "object" && record && "plan" in record ? record.plan : "Shared trip details";
  const itineraryItems =
    typeof record === "object" && record && "itineraryItems" in record && Array.isArray(record.itineraryItems)
      ? record.itineraryItems
      : [];
  const completedItinerary =
    typeof record === "object" && record && "completedItinerary" in record && Array.isArray(record.completedItinerary)
      ? record.completedItinerary
      : [];
  const flightWindows =
    typeof record === "object" && record && "flightWindows" in record && Array.isArray(record.flightWindows)
      ? record.flightWindows
      : [];
  const packingItems =
    typeof record === "object" && record && "packingItems" in record && Array.isArray(record.packingItems)
      ? record.packingItems
      : [];
  const packedItems =
    typeof record === "object" && record && "packedItems" in record && Array.isArray(record.packedItems)
      ? record.packedItems
      : [];
  const budgetItems =
    typeof record === "object" && record && "budgetItems" in record && Array.isArray(record.budgetItems)
      ? record.budgetItems
      : [];
  const budgetClosed =
    typeof record === "object" && record && "budgetClosed" in record
      ? Boolean(record.budgetClosed)
      : false;

  return {
    title: typeof title === "string" ? title : "Shared trip",
    plan: typeof plan === "string" ? plan : "Shared trip details",
    itineraryItems: Array.isArray(itineraryItems) ? itineraryItems : [],
    completedItinerary: Array.isArray(completedItinerary) ? completedItinerary : [],
    flightWindows: Array.isArray(flightWindows) ? flightWindows : [],
    packingItems: Array.isArray(packingItems) ? packingItems : [],
    packedItems: Array.isArray(packedItems) ? packedItems : [],
    budgetItems: Array.isArray(budgetItems) ? budgetItems : [],
    budgetClosed,
  };
}

export async function fetchSharedVisitPlans(userId: string): Promise<VisitPlan[]> {
  const peerByRelationshipId = await fetchRelationshipPeers(userId);
  const relationshipIds = Array.from(peerByRelationshipId.keys());

  if (!relationshipIds.length) {
    return [];
  }

  const { data, error } = await supabase
    .from("visit_plans")
    .select("id, relationship_id, destination, starts_on, ends_on, checklist")
    .in("relationship_id", relationshipIds)
    .order("starts_on", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).flatMap((visit) => {
    const peerId = peerByRelationshipId.get(visit.relationship_id);
    if (!peerId) {
      return [];
    }

    const { title, plan } = extractChecklistMetadata(visit.checklist);
    const startDate = visit.starts_on;
    const endDate = visit.ends_on || undefined;
    const date = endDate
      ? `${new Date(`${startDate}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}-${new Date(`${endDate}T12:00:00`).toLocaleDateString("en-US", { day: "numeric", year: "numeric" })}`
      : new Date(`${startDate}T12:00:00`).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

    return [
      {
        id: `remote-visit-${visit.id}`,
        title,
        location: visit.destination,
        date,
        startDate,
        endDate,
        daysAway: getDaysAway(startDate),
        plan,
        participantIds: [buildSharedConnectionId(visit.relationship_id, peerId)],
        archived: false,
      } satisfies VisitPlan,
    ];
  });
}

export async function fetchSharedTripToolkit(userId: string): Promise<{
  itineraryItems: ItineraryItem[];
  completedItinerary: string[];
  flightWindows: FlightWindow[];
  packingItems: PackingItem[];
  packedItems: string[];
  budgetItems: BudgetItem[];
  closedBudgetTrips: string[];
}> {
  const peerByRelationshipId = await fetchRelationshipPeers(userId);
  const relationshipIds = Array.from(peerByRelationshipId.keys());

  if (!relationshipIds.length) {
    return {
      itineraryItems: [],
      completedItinerary: [],
      flightWindows: [],
      packingItems: [],
      packedItems: [],
      budgetItems: [],
      closedBudgetTrips: [],
    };
  }

  const { data, error } = await supabase
    .from("visit_plans")
    .select("id, relationship_id, destination, checklist")
    .in("relationship_id", relationshipIds)
    .order("starts_on", { ascending: true });

  if (error) {
    throw error;
  }

  const itineraryItems: ItineraryItem[] = [];
  const completedItinerary: string[] = [];
  const flightWindows: FlightWindow[] = [];
  const packingItems: PackingItem[] = [];
  const packedItems: string[] = [];
  const budgetItems: BudgetItem[] = [];
  const closedBudgetTrips: string[] = [];

  (data ?? []).forEach((visit) => {
    const metadata = extractChecklistMetadata(visit.checklist);

    metadata.itineraryItems.forEach((item) => {
      const remoteId = buildRemoteToolkitId("itinerary", visit.id, String(item.id ?? ""));
      itineraryItems.push({
        id: remoteId,
        visitTitle: metadata.title,
        dateValue: typeof item.dateValue === "string" ? item.dateValue : undefined,
        startTime: typeof item.startTime === "string" ? item.startTime : undefined,
        endTime: typeof item.endTime === "string" ? item.endTime : undefined,
        time: typeof item.time === "string" ? item.time : "",
        title: typeof item.title === "string" ? item.title : "",
        detail: typeof item.detail === "string" ? item.detail : "",
      });
    });

    metadata.completedItinerary.forEach((itemId) => {
      completedItinerary.push(buildRemoteToolkitId("itinerary", visit.id, String(itemId)));
    });

    metadata.flightWindows.forEach((item) => {
      flightWindows.push({
        id: buildRemoteToolkitId("flight-window", visit.id, String(item.id ?? "")),
        trip: visit.destination,
        startDate: typeof item.startDate === "string" ? item.startDate : "",
        endDate: typeof item.endDate === "string" ? item.endDate : undefined,
        price: typeof item.price === "number" ? item.price : undefined,
        note: typeof item.note === "string" ? item.note : undefined,
      });
    });

    metadata.packingItems.forEach((item) => {
      const remoteId = buildRemoteToolkitId("packing", visit.id, String(item.id ?? ""));
      packingItems.push({
        id: remoteId,
        label: typeof item.label === "string" ? item.label : "",
        trip: visit.destination,
      });
    });

    metadata.packedItems.forEach((itemId) => {
      packedItems.push(buildRemoteToolkitId("packing", visit.id, String(itemId)));
    });

    metadata.budgetItems.forEach((item) => {
      budgetItems.push({
        id: buildRemoteToolkitId("budget", visit.id, String(item.id ?? "")),
        label: typeof item.label === "string" ? item.label : "",
        amount: typeof item.amount === "number" ? item.amount : 0,
        category: typeof item.category === "string" ? item.category : "",
        payer: typeof item.payer === "string" ? item.payer : "",
        trip: visit.destination,
      });
    });

    if (metadata.budgetClosed) {
      closedBudgetTrips.push(visit.destination);
    }
  });

  return {
    itineraryItems,
    completedItinerary,
    flightWindows,
    packingItems,
    packedItems,
    budgetItems,
    closedBudgetTrips,
  };
}

export async function saveSharedVisitPlan(input: {
  userId: string;
  trip: VisitPlan;
  itineraryItems?: ItineraryItem[];
  completedItinerary?: string[];
  flightWindows?: FlightWindow[];
  packingItems?: PackingItem[];
  packedItems?: string[];
  budgetItems?: BudgetItem[];
  budgetClosed?: boolean;
}) {
  const sharedParticipantId =
    (input.trip.participantIds ?? []).find((id) => parseSharedConnectionId(id)) ?? null;
  if (!sharedParticipantId) {
    return null;
  }

  const parsed = parseSharedConnectionId(sharedParticipantId);
  if (!parsed) {
    return null;
  }

  const remoteId = input.trip.id.startsWith("remote-visit-")
    ? input.trip.id.replace("remote-visit-", "")
    : null;

  let existingMetadata: SharedTripChecklistPayload = {
    title: input.trip.title,
    plan: input.trip.plan,
    itineraryItems: [],
    completedItinerary: [],
    flightWindows: [],
    packingItems: [],
    packedItems: [],
    budgetItems: [],
    budgetClosed: false,
  };

  if (remoteId) {
    const { data: existingVisit, error: existingError } = await supabase
      .from("visit_plans")
      .select("checklist")
      .eq("id", remoteId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingVisit?.checklist) {
      existingMetadata = extractChecklistMetadata(existingVisit.checklist);
    }
  }

  const checklist = [
    {
      title: input.trip.title,
      plan: input.trip.plan,
      itineraryItems:
        input.itineraryItems?.map((item) => ({
          id: stripRemoteToolkitId("itinerary", remoteId ?? "local", item.id),
          dateValue: item.dateValue,
          startTime: item.startTime,
          endTime: item.endTime,
          time: item.time,
          title: item.title,
          detail: item.detail,
        })) ?? existingMetadata.itineraryItems,
      completedItinerary:
        input.completedItinerary?.map((itemId) =>
          stripRemoteToolkitId("itinerary", remoteId ?? "local", itemId)
        ) ?? existingMetadata.completedItinerary,
      flightWindows:
        input.flightWindows?.map((item) => ({
          id: stripRemoteToolkitId("flight-window", remoteId ?? "local", item.id),
          startDate: item.startDate,
          endDate: item.endDate,
          price: item.price,
          note: item.note,
        })) ?? existingMetadata.flightWindows,
      packingItems:
        input.packingItems?.map((item) => ({
          id: stripRemoteToolkitId("packing", remoteId ?? "local", item.id),
          label: item.label,
        })) ?? existingMetadata.packingItems,
      packedItems:
        input.packedItems?.map((itemId) =>
          stripRemoteToolkitId("packing", remoteId ?? "local", itemId)
        ) ?? existingMetadata.packedItems,
      budgetItems:
        input.budgetItems?.map((item) => ({
          id: stripRemoteToolkitId("budget", remoteId ?? "local", item.id),
          label: item.label,
          amount: item.amount,
          category: item.category,
          payer: item.payer,
        })) ?? existingMetadata.budgetItems,
      budgetClosed: input.budgetClosed ?? existingMetadata.budgetClosed,
    },
  ];

  const payload = {
    relationship_id: parsed.relationshipId,
    destination: input.trip.location,
    starts_on: input.trip.startDate,
    ends_on: input.trip.endDate || null,
    checklist,
  };

  const query = remoteId
    ? supabase.from("visit_plans").update(payload).eq("id", remoteId).select("id").single()
    : supabase.from("visit_plans").insert(payload).select("id").single();

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return {
    ...input.trip,
    id: `remote-visit-${data.id}`,
    participantIds: [sharedParticipantId],
    daysAway: getDaysAway(input.trip.startDate),
  } satisfies VisitPlan;
}

export async function deleteSharedVisitPlan(visitId: string) {
  const remoteId = visitId.replace("remote-visit-", "");
  const { error } = await supabase.from("visit_plans").delete().eq("id", remoteId);
  if (error) {
    throw error;
  }
}
