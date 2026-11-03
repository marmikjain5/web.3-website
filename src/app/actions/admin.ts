"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";


import fs, { mkdir, writeFile } from "fs/promises";
import path from "path";

// -------------------------------------------------------------
// Admin Auth Helpers
// -------------------------------------------------------------

export async function checkAdminSession(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return profile?.role === "admin";
  } catch {
    return false;
  }
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Not authorized: admin role required");
  }

  return supabase;
}

export async function logoutAdmin(): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return { success: true };
  } catch {
    return { success: true };
  }
}


// ─────────────────────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────────────────────

export type EventRow = {
  id: string;
  title: string;
  subtitle: string;
  slug?: string;
  date: string;
  start_date: string;
  location: string;
  prize: string;
  tags: string[];
  team_min: number;
  team_max: number;
  description: string;
  short_description?: string;
  detailed_description?: string;
  chain: string | null;
  sponsors: string[];
  status: "open" | "soon" | "closed";
  publication_status?: "published" | "draft";
  event_classification?: "upcoming" | "archived";
  event_category?: string;
  image_url: string | null;
  banner_url?: string | null;
  is_featured?: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
};

export type RegistrationFieldRow = {
  id: string;
  event_id: string;
  field_name: string;
  prompt: string;
  field_type: "text" | "email" | "number" | "select";
  required: boolean;
  options: string[] | null;
  sort_order: number;
};

export type TeamMemberRow = {
  id: string;
  name: string;
  role: string;
  department: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  hierarchy_level: string | null;
  socials: Record<string, string>;
};

// Get all events (admin view — includes all statuses)
export async function getEvents(): Promise<{ data: EventRow[] | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data: data as EventRow[], error: null };
}

// Get events for public (same query, but called from public pages)
export async function getPublicEvents(): Promise<EventRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: false });
  return (data as EventRow[]) || [];
}

// Create a new event
export async function createEvent(formData: FormData): Promise<{ success: boolean; error?: string; eventId?: string }> {
  try {
    const supabase = await requireAdmin();

    // Handle image upload
    let imageUrl: string | null = null;
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      const ext = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(fileName, imageFile);
      if (uploadError) return { success: false, error: `Image upload failed: ${uploadError.message}` };

      const { data: urlData } = supabase.storage
        .from("event-images")
        .getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    // Parse tags and sponsors from comma-separated strings
    const tagsRaw = (formData.get("tags") as string) || "";
    const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
    const sponsorsRaw = (formData.get("sponsors") as string) || "";
    const sponsors = sponsorsRaw.split(",").map((s) => s.trim()).filter(Boolean);

    const { data, error } = await supabase.from("events").insert([
      {
        title: formData.get("title") as string,
        subtitle: formData.get("subtitle") as string,
        date: formData.get("date") as string,
        start_date: formData.get("start_date") as string,
        location: formData.get("location") as string,
        prize: formData.get("prize") as string,
        tags,
        team_min: parseInt(formData.get("team_min") as string) || 1,
        team_max: parseInt(formData.get("team_max") as string) || 4,
        description: formData.get("description") as string,
        chain: (formData.get("chain") as string) || null,
        sponsors,
        status: (formData.get("status") as string) || "open",
        image_url: imageUrl,
      },
    ]).select("id").single();

    if (error) return { success: false, error: error.message };
    return { success: true, eventId: data?.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Update event status (open/close registrations)
export async function updateEventStatus(
  eventId: string,
  status: "open" | "soon" | "closed"
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase
      .from("events")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", eventId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Get a single event (admin view)
export async function getEvent(eventId: string): Promise<{ data: EventRow | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("events").select("*").eq("id", eventId).single();
  if (error) return { data: null, error: error.message };
  return { data: data as EventRow, error: null };
}

// Update an existing event (admin)
export async function updateEvent(eventId: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await requireAdmin();

    // Handle possible new image upload (Supabase storage)
    let imageUrl: string | null = null;
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      const ext = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("event-images").upload(fileName, imageFile);
      if (uploadError) return { success: false, error: `Image upload failed: ${uploadError.message}` };
      const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    // Parse tags & sponsors again (same as createEvent)
    const tagsRaw = (formData.get("tags") as string) || "";
    const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
    const sponsorsRaw = (formData.get("sponsors") as string) || "";
    const sponsors = sponsorsRaw.split(",").map((s) => s.trim()).filter(Boolean);

    const updatePayload: any = {
      title: formData.get("title") as string,
      subtitle: formData.get("subtitle") as string,
      date: formData.get("date") as string,
      start_date: formData.get("start_date") as string,
      location: formData.get("location") as string,
      prize: formData.get("prize") as string,
      tags,
      team_min: parseInt(formData.get("team_min") as string) || 1,
      team_max: parseInt(formData.get("team_max") as string) || 4,
      description: formData.get("description") as string,
      chain: (formData.get("chain") as string) || null,
      sponsors,
      status: (formData.get("status") as string) || "open",
    };
    if (imageUrl) updatePayload.image_url = imageUrl;

    const { error } = await supabase.from("events").update(updatePayload).eq("id", eventId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// REGISTRATION FIELDS
// ─────────────────────────────────────────────────────────────

export async function getRegistrationFields(
  eventId: string
): Promise<RegistrationFieldRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("registration_fields")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });
  return (data as RegistrationFieldRow[]) || [];
}

export async function upsertRegistrationFields(
  eventId: string,
  fields: Omit<RegistrationFieldRow, "id" | "event_id">[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await requireAdmin();

    // Delete existing fields for this event
    await supabase
      .from("registration_fields")
      .delete()
      .eq("event_id", eventId);

    // Insert new fields
    if (fields.length > 0) {
      const rows = fields.map((f, idx) => ({
        event_id: eventId,
        field_name: f.field_name,
        prompt: f.prompt,
        field_type: f.field_type,
        required: f.required,
        options: f.options,
        sort_order: idx,
      }));
      const { error } = await supabase.from("registration_fields").insert(rows);
      if (error) return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// TEAM MEMBERS
// ─────────────────────────────────────────────────────────────

export async function getTeamMembers(): Promise<TeamMemberRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("team_members")
    .select("*")
    .order("sort_order", { ascending: true });

  if (!data) return [];

  const hierarchyWeights: Record<string, number> = {
    president: 1,
    lead: 2,
    "": 3, // Associates / default
  };

  return (data as TeamMemberRow[]).sort((a, b) => {
    const wA = hierarchyWeights[a.hierarchy_level || ""] || 3;
    const wB = hierarchyWeights[b.hierarchy_level || ""] || 3;
    if (wA !== wB) return wA - wB;
    return a.sort_order - b.sort_order;
  });
}




export async function createTeamMember(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await requireAdmin();

    let imageUrl: string | null = null;
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      const ext = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const publicDir = path.join(process.cwd(), "public", "members");
      
      try {
        await mkdir(publicDir, { recursive: true });
        await writeFile(path.join(publicDir, fileName), buffer);
        imageUrl = `/members/${fileName}`;
      } catch (uploadError: any) {
        return { success: false, error: `Image upload failed: ${uploadError.message}` };
      }
    }

    const socials: Record<string, string> = {};
    ["twitter", "linkedin", "github", "instagram"].forEach((key) => {
      const val = formData.get(key) as string;
      if (val) socials[key] = val;
    });

    // Get the highest sort_order
    const { data: lastMember } = await supabase
      .from("team_members")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const { error } = await supabase.from("team_members").insert([
      {
        name: formData.get("name") as string,
        role: formData.get("role") as string,
        department: (formData.get("department") as string) || "core",
        description: (formData.get("description") as string) || null,
        hierarchy_level: (formData.get("hierarchy_level") as string) || null,
        image_url: imageUrl,
        sort_order: (lastMember?.sort_order ?? -1) + 1,
        socials,
      },
    ]);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateTeamMember(
  memberId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await requireAdmin();

    let imageUrl: string | null = null;
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      const ext = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const publicDir = path.join(process.cwd(), "public", "members");
      
      try {
        await mkdir(publicDir, { recursive: true });
        await writeFile(path.join(publicDir, fileName), buffer);
        imageUrl = `/members/${fileName}`;
      } catch (uploadError: any) {
        return { success: false, error: `Image upload failed: ${uploadError.message}` };
      }
    }

    const socials: Record<string, string> = {};
    ["twitter", "linkedin", "github", "instagram"].forEach((key) => {
      const val = formData.get(key) as string;
      if (val) socials[key] = val;
    });

    const payload: any = {
      name: formData.get("name") as string,
      role: formData.get("role") as string,
      department: (formData.get("department") as string) || "core",
      description: (formData.get("description") as string) || null,
      hierarchy_level: (formData.get("hierarchy_level") as string) || null,
      socials,
    };
    if (imageUrl) payload.image_url = imageUrl;

    const { error } = await supabase
      .from("team_members")
      .update(payload)
      .eq("id", memberId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteTeamMember(
  memberId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", memberId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
