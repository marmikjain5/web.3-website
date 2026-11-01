"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import fs, { mkdir, writeFile } from "fs/promises";
import path from "path";

const ADMIN_SECRET = process.env.ADMIN_PASSWORD || "web3labs2026";

// ─────────────────────────────────────────────────────────────
// Admin Auth Helpers
// ─────────────────────────────────────────────────────────────

export async function verifyAdminPassword(passcode: string): Promise<{ success: boolean; error?: string }> {
  if (passcode.trim() === ADMIN_SECRET) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", ADMIN_SECRET, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return { success: true };
  }
  return { success: false, error: "Access denied: Invalid admin key" };
}

export async function logoutAdmin(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return { success: true };
}

export async function checkAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;
    if (session && session === ADMIN_SECRET) return true;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role === "admin") return true;
    }
  } catch (err) {
    // ignore
  }
  return false;
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  const supabase = await createClient();

  if (session && session === ADMIN_SECRET) {
    return supabase;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") return supabase;
  }

  throw new Error("Not authorized: admin session or role required");
}

// ─────────────────────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────────────────────

export type EventRow = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  start_date: string;
  location: string;
  prize: string;
  tags: string[];
  team_min: number;
  team_max: number;
  description: string;
  chain: string | null;
  sponsors: string[];
  status: "open" | "soon" | "closed";
  image_url: string | null;
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

// ─────────────────────────────────────────────────────────────
// SITE CONFIGURATION & CONTENT CUSTOMIZATION
// ─────────────────────────────────────────────────────────────

export type SiteConfig = {
  heroTagline: string;
  heroHeadline: string;
  heroDescription: string;
  incubationCount: number;
  totalFundsRaised: string;
  partnerCount: number;
  announcements: string[];
  faqs: { question: string; answer: string; category?: string }[];
};

const DEFAULT_CONFIG: SiteConfig = {
  heroTagline: "BACKING TOMORROW",
  heroHeadline: "ROW BACKING",
  heroDescription: "Backing the very best web3 builders — transforming visionary ideas into real-world growth.",
  incubationCount: 14,
  totalFundsRaised: "$100M+",
  partnerCount: 50,
  announcements: [
    "ChainGPT Labs Incubation Batch #3 Applications Open",
    "Over $100M+ Raised Across Portfolio Projects",
    "Join our Global Mentorship & Grant Program",
    "Decrypto Hackathon 2026 Registration Live"
  ],
  faqs: [
    {
      question: "What is ChainGPT / Web3 Labs Incubation?",
      answer: "We are an end-to-end Web3 incubator and venture studio backing early-stage visionary founders across AI, DeFi, DePIN, and Layer 1/2 infrastructure with capital, engineering, marketing, and institutional exchange listings.",
      category: "Incubation"
    },
    {
      question: "How do teams get selected for incubation?",
      answer: "Our investment committee reviews applications on a rolling basis. We evaluate team technical capability, product-market fit, tokenomics design, and long-term ecosystem alignment.",
      category: "Selection"
    },
    {
      question: "What support does Web3 Labs provide beyond funding?",
      answer: "We provide hands-on tokenomics design, smart contract security audits, go-to-market advisory, top-tier exchange listings, and direct access to Tier 1 VC partners.",
      category: "Support"
    },
    {
      question: "Can student projects or hackathon winners apply?",
      answer: "Absolutely! Many of our most successful incubations started at university hackathons. We provide customized fast-track grants for standout builder teams.",
      category: "Eligibility"
    }
  ]
};

const CONFIG_FILE_PATH = path.join(process.cwd(), "src", "data", "siteConfig.json");

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const raw = await fs.readFile(CONFIG_FILE_PATH, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function updateSiteConfig(newConfig: Partial<SiteConfig>): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const current = await getSiteConfig();
    const merged = { ...current, ...newConfig };
    
    // Ensure dir exists
    const dir = path.dirname(CONFIG_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(merged, null, 2), "utf-8");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

