import { VisitPlan } from "../types";
import { supabase } from "./supabase";
import { buildSharedConnectionId, parseSharedConnectionId } from "./sharedRelationships";
import { parseDateValue } from "./dateHelpers";

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

function extractChecklistMetadata(checklist: unknown) {
  const list = Array.isArray(checklist) ? checklist : [];
  const title =
    list.find((item) => item && typeof item === "object" && "title" in item)?.title ??
    "Shared trip";
  const plan =
    list.find((item) => item && typeof item === "object" && "plan" in item)?.plan ??
    "Shared trip details";

  return {
    title: typeof title === "string" ? title : "Shared trip",
    plan: typeof plan === "string" ? plan : "Shared trip details",
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

export async function saveSharedVisitPlan(input: {
  userId: string;
  trip: VisitPlan;
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

  const checklist = [
    {
      title: input.trip.title,
      plan: input.trip.plan,
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
