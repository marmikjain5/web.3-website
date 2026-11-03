"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/serverAuth";
import {
  type EventRow,
  type EventDetail,
  type EventDayRow,
  type EventSessionRow,
  type EventGalleryRow,
  type EventSpeakerRow,
  type EventRegistrationStatus,
  type EventPublicationStatus,
  type EventClassification,
  DEFAULT_DECRYPTO_EVENT,
  DEFAULT_DECRYPTO_DAYS,
  slugifyEventTitle,
  isValidEventUrl,
} from "@/lib/events";

// ─────────────────────────────────────────────────────────────
// PUBLIC ACTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all published events, grouped into upcoming and archived.
 */
export async function getPublicEventsList(): Promise<{
  success: boolean;
  upcoming: EventRow[];
  archived: EventRow[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Query events table
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("start_date", { ascending: false });

    if (error) {
      console.warn("Error fetching events from Supabase:", error.message);
      // Fallback to default Decrypto archived event
      return {
        success: true,
        upcoming: [],
        archived: [DEFAULT_DECRYPTO_EVENT],
      };
    }

    const rows: EventRow[] = (data || []).map((row: any) => ({
      ...row,
      slug: row.slug || slugifyEventTitle(row.title),
      publication_status: row.publication_status || "published",
      event_classification:
        row.event_classification ||
        (new Date(row.start_date).getTime() > Date.now() ? "upcoming" : "archived"),
    }));

    // Only published events are visible publicly
    const published = rows.filter((e) => e.publication_status === "published");

    const upcoming = published.filter(
      (e) => e.event_classification === "upcoming"
    );
    const archived = published.filter(
      (e) => e.event_classification === "archived"
    );

    // If database had 0 published events, supply Decrypto as default archive
    if (published.length === 0) {
      archived.push(DEFAULT_DECRYPTO_EVENT);
    }

    return {
      success: true,
      upcoming,
      archived,
    };
  } catch (err: any) {
    console.error("Exception in getPublicEventsList:", err);
    return {
      success: true,
      upcoming: [],
      archived: [DEFAULT_DECRYPTO_EVENT],
    };
  }
}

/**
 * Fetch a single published event by slug with all child content.
 */
export async function getPublicEventBySlug(
  slug: string
): Promise<EventDetail | null> {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().trim();

  try {
    const supabase = await createClient();

    // Query event by slug (or fallback by title match)
    let { data: event, error } = await supabase
      .from("events")
      .select("*")
      .eq("slug", cleanSlug)
      .single();

    // If not found by slug, try matching id or title for resilience
    if (!event) {
      const { data: byTitle } = await supabase
        .from("events")
        .select("*")
        .ilike("title", cleanSlug)
        .single();
      if (byTitle) event = byTitle;
    }

    if (!event) {
      if (cleanSlug === "decrypto") {
        return DEFAULT_DECRYPTO_EVENT;
      }
      return null;
    }

    // Only allow public access if published
    if (event.publication_status === "draft") {
      return null;
    }

    // Fetch days and sessions
    const { data: daysData } = await supabase
      .from("event_days")
      .select("*")
      .eq("event_id", event.id)
      .order("sort_order", { ascending: true })
      .order("day_number", { ascending: true });

    let days: EventDayRow[] = [];
    if (daysData && daysData.length > 0) {
      const dayIds = daysData.map((d: any) => d.id);
      const { data: sessionsData } = await supabase
        .from("event_sessions")
        .select("*")
        .in("day_id", dayIds)
        .order("sort_order", { ascending: true });

      days = daysData.map((day: any) => ({
        ...day,
        slots: (sessionsData || []).filter((s: any) => s.day_id === day.id),
      }));
    } else if (cleanSlug === "decrypto") {
      // If DB has DECRYPTO but hasn't seeded days, provide default days
      days = DEFAULT_DECRYPTO_DAYS;
    }

    // Fetch gallery
    const { data: galleryData } = await supabase
      .from("event_gallery")
      .select("*")
      .eq("event_id", event.id)
      .order("sort_order", { ascending: true });

    // Fetch speakers
    const { data: speakersData } = await supabase
      .from("event_speakers")
      .select("*")
      .eq("event_id", event.id)
      .order("sort_order", { ascending: true });

    const detail: EventDetail = {
      ...event,
      slug: event.slug || slugifyEventTitle(event.title),
      publication_status: event.publication_status || "published",
      event_classification: event.event_classification || "archived",
      learning_outcomes:
        event.learning_outcomes && event.learning_outcomes.length > 0
          ? event.learning_outcomes
          : cleanSlug === "decrypto"
          ? DEFAULT_DECRYPTO_EVENT.learning_outcomes
          : [],
      ticker_items:
        event.ticker_items && event.ticker_items.length > 0
          ? event.ticker_items
          : cleanSlug === "decrypto"
          ? DEFAULT_DECRYPTO_EVENT.ticker_items
          : [],
      days,
      gallery: galleryData || [],
      speakers: speakersData || [],
    };

    return detail;
  } catch (err: any) {
    console.error("Exception in getPublicEventBySlug:", err);
    if (cleanSlug === "decrypto") {
      return DEFAULT_DECRYPTO_EVENT;
    }
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// ADMIN OPERATIONS (Guarded by requireAdmin)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all events for Admin management with full counts and child counts.
 */
export async function adminGetAllEvents(): Promise<{
  success: boolean;
  data: EventRow[];
  error?: string;
}> {
  try {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("start_date", { ascending: false });

    if (error) return { success: false, data: [], error: error.message };

    const rows: EventRow[] = (data || []).map((row: any) => ({
      ...row,
      slug: row.slug || slugifyEventTitle(row.title),
      publication_status: row.publication_status || "published",
      event_classification: row.event_classification || "upcoming",
    }));

    return { success: true, data: rows };
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}

/**
 * Create a new event with poster upload.
 */
export async function adminCreateEvent(
  formData: FormData
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const { supabase } = await requireAdmin();

    const title = (formData.get("title") as string)?.trim();
    if (!title) return { success: false, error: "Title is required" };

    let slug = (formData.get("slug") as string)?.trim();
    if (!slug) {
      slug = slugifyEventTitle(title);
    } else {
      slug = slugifyEventTitle(slug);
    }

    // Check slug uniqueness
    const { data: existingSlug } = await supabase
      .from("events")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }

    // Handle poster upload to 'event-images' bucket
    let imageUrl: string | null = null;
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      const ext = imageFile.name.split(".").pop();
      const fileName = `poster-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("event-images")
        .upload(fileName, imageFile, { contentType: imageFile.type });

      if (!uploadErr) {
        const { data: urlData } = supabase.storage
          .from("event-images")
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    }

    // Handle banner upload
    let bannerUrl: string | null = null;
    const bannerFile = formData.get("banner") as File | null;
    if (bannerFile && bannerFile.size > 0) {
      const ext = bannerFile.name.split(".").pop();
      const fileName = `banner-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("event-images")
        .upload(fileName, bannerFile, { contentType: bannerFile.type });

      if (!uploadErr) {
        const { data: urlData } = supabase.storage
          .from("event-images")
          .getPublicUrl(fileName);
        bannerUrl = urlData.publicUrl;
      }
    }

    // Parse arrays
    const tagsRaw = (formData.get("tags") as string) || "";
    const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
    const sponsorsRaw = (formData.get("sponsors") as string) || "";
    const sponsors = sponsorsRaw.split(",").map((s) => s.trim()).filter(Boolean);

    const payload: any = {
      title,
      subtitle: (formData.get("subtitle") as string)?.trim() || "",
      slug,
      date: (formData.get("date") as string)?.trim() || "TBA",
      start_date: (formData.get("start_date") as string) || new Date().toISOString(),
      location: (formData.get("location") as string)?.trim() || "",
      prize: (formData.get("prize") as string)?.trim() || "",
      tags,
      team_min: parseInt(formData.get("team_min") as string) || 1,
      team_max: parseInt(formData.get("team_max") as string) || 4,
      description: (formData.get("description") as string)?.trim() || "",
      short_description: (formData.get("short_description") as string)?.trim() || "",
      detailed_description: (formData.get("detailed_description") as string)?.trim() || "",
      chain: (formData.get("chain") as string)?.trim() || null,
      sponsors,
      status: (formData.get("status") as EventRegistrationStatus) || "open",
      publication_status:
        (formData.get("publication_status") as EventPublicationStatus) || "published",
      event_classification:
        (formData.get("event_classification") as EventClassification) || "upcoming",
      event_category: (formData.get("event_category") as string)?.trim() || "Hackathon",
      is_featured: formData.get("is_featured") === "true",
      sort_order: parseInt(formData.get("sort_order") as string) || 0,
      image_url: imageUrl,
      banner_url: bannerUrl,
    };

    const { data: newEvent, error } = await supabase
      .from("events")
      .insert([payload])
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/events");
    revalidatePath("/admin");
    return { success: true, eventId: newEvent?.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Update an existing event.
 */
export async function adminUpdateEvent(
  eventId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await requireAdmin();

    const title = (formData.get("title") as string)?.trim();
    if (!title) return { success: false, error: "Title is required" };

    let slug = (formData.get("slug") as string)?.trim();
    if (slug) {
      slug = slugifyEventTitle(slug);
      // Ensure unique slug excluding this event
      const { data: conflict } = await supabase
        .from("events")
        .select("id")
        .eq("slug", slug)
        .neq("id", eventId)
        .maybeSingle();

      if (conflict) {
        return { success: false, error: `Slug "${slug}" is already in use by another event.` };
      }
    }

    // Handle new poster image if uploaded
    let imageUrl: string | null = null;
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      const ext = imageFile.name.split(".").pop();
      const fileName = `poster-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("event-images")
        .upload(fileName, imageFile, { contentType: imageFile.type });

      if (!uploadErr) {
        const { data: urlData } = supabase.storage
          .from("event-images")
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    }

    // Handle new banner image if uploaded
    let bannerUrl: string | null = null;
    const bannerFile = formData.get("banner") as File | null;
    if (bannerFile && bannerFile.size > 0) {
      const ext = bannerFile.name.split(".").pop();
      const fileName = `banner-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("event-images")
        .upload(fileName, bannerFile, { contentType: bannerFile.type });

      if (!uploadErr) {
        const { data: urlData } = supabase.storage
          .from("event-images")
          .getPublicUrl(fileName);
        bannerUrl = urlData.publicUrl;
      }
    }

    const tagsRaw = (formData.get("tags") as string) || "";
    const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
    const sponsorsRaw = (formData.get("sponsors") as string) || "";
    const sponsors = sponsorsRaw.split(",").map((s) => s.trim()).filter(Boolean);

    const updatePayload: any = {
      title,
      subtitle: (formData.get("subtitle") as string)?.trim() || "",
      date: (formData.get("date") as string)?.trim() || "TBA",
      start_date: (formData.get("start_date") as string) || new Date().toISOString(),
      location: (formData.get("location") as string)?.trim() || "",
      prize: (formData.get("prize") as string)?.trim() || "",
      tags,
      team_min: parseInt(formData.get("team_min") as string) || 1,
      team_max: parseInt(formData.get("team_max") as string) || 4,
      description: (formData.get("description") as string)?.trim() || "",
      short_description: (formData.get("short_description") as string)?.trim() || "",
      detailed_description: (formData.get("detailed_description") as string)?.trim() || "",
      chain: (formData.get("chain") as string)?.trim() || null,
      sponsors,
      status: (formData.get("status") as EventRegistrationStatus) || "open",
      publication_status:
        (formData.get("publication_status") as EventPublicationStatus) || "published",
      event_classification:
        (formData.get("event_classification") as EventClassification) || "upcoming",
      event_category: (formData.get("event_category") as string)?.trim() || "Hackathon",
      is_featured: formData.get("is_featured") === "true",
      sort_order: parseInt(formData.get("sort_order") as string) || 0,
      updated_at: new Date().toISOString(),
    };

    if (slug) updatePayload.slug = slug;
    if (imageUrl) updatePayload.image_url = imageUrl;
    if (bannerUrl) updatePayload.banner_url = bannerUrl;

    const { error } = await supabase
      .from("events")
      .update(updatePayload)
      .eq("id", eventId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/events");
    if (slug) revalidatePath(`/events/${slug}`);
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete an event and all its child associations.
 */
export async function adminDeleteEvent(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) return { success: false, error: error.message };

    revalidatePath("/events");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Quick toggle publication status ('published' <-> 'draft').
 */
export async function adminToggleEventPublish(
  eventId: string,
  currentStatus: EventPublicationStatus
): Promise<{ success: boolean; newStatus?: EventPublicationStatus; error?: string }> {
  try {
    const { supabase } = await requireAdmin();
    const newStatus: EventPublicationStatus =
      currentStatus === "published" ? "draft" : "published";

    const { error } = await supabase
      .from("events")
      .update({ publication_status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", eventId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/events");
    revalidatePath("/admin");
    return { success: true, newStatus };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Quick toggle classification ('upcoming' <-> 'archived').
 */
export async function adminToggleEventArchive(
  eventId: string,
  currentClassification: EventClassification
): Promise<{ success: boolean; newClassification?: EventClassification; error?: string }> {
  try {
    const { supabase } = await requireAdmin();
    const newClassification: EventClassification =
      currentClassification === "upcoming" ? "archived" : "upcoming";

    const { error } = await supabase
      .from("events")
      .update({
        event_classification: newClassification,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/events");
    revalidatePath("/admin");
    return { success: true, newClassification };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Save / replace entire multi-day schedule and sessions for an event.
 */
export async function adminSaveEventSchedule(
  eventId: string,
  days: EventDayRow[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await requireAdmin();

    // 1. Delete existing days for this event (sessions cascade on delete)
    const { error: delErr } = await supabase
      .from("event_days")
      .delete()
      .eq("event_id", eventId);

    if (delErr) return { success: false, error: delErr.message };

    // 2. Insert new days and sessions sequentially
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const { data: newDay, error: dayErr } = await supabase
        .from("event_days")
        .insert([
          {
            event_id: eventId,
            day_number: day.day_number || i + 1,
            label: day.label || `Day ${i + 1}`,
            heading: day.heading || "Schedule",
            event_date: day.event_date || "",
            venue: day.venue || "",
            sort_order: i,
          },
        ])
        .select("id")
        .single();

      if (dayErr || !newDay) {
        console.error("Error creating day:", dayErr);
        continue;
      }

      if (day.slots && day.slots.length > 0) {
        const sessionPayloads = day.slots.map((s, idx) => ({
          day_id: newDay.id,
          time_slot: s.time_slot || "",
          title: s.title || "",
          description: s.description || "",
          is_highlight: !!s.is_highlight,
          is_break: !!s.is_break,
          sub_topics: s.sub_topics || [],
          sort_order: idx,
        }));

        await supabase.from("event_sessions").insert(sessionPayloads);
      }
    }

    revalidatePath("/events");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Upload an image to event gallery.
 */
export async function adminUploadGalleryImage(
  eventId: string,
  formData: FormData
): Promise<{ success: boolean; image?: EventGalleryRow; error?: string }> {
  try {
    const { supabase } = await requireAdmin();

    const file = formData.get("image") as File | null;
    const caption = (formData.get("caption") as string)?.trim() || "";

    if (!file || file.size === 0) {
      return { success: false, error: "No image file provided." };
    }

    const ext = file.name.split(".").pop();
    const fileName = `gallery-${eventId}-${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("event-images")
      .upload(fileName, file, { contentType: file.type });

    if (uploadErr) return { success: false, error: uploadErr.message };

    const { data: urlData } = supabase.storage
      .from("event-images")
      .getPublicUrl(fileName);

    const { data: galleryRow, error: insertErr } = await supabase
      .from("event_gallery")
      .insert([
        {
          event_id: eventId,
          image_url: urlData.publicUrl,
          caption,
          sort_order: 0,
        },
      ])
      .select("*")
      .single();

    if (insertErr) return { success: false, error: insertErr.message };

    revalidatePath("/events");
    return { success: true, image: galleryRow };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete a gallery image.
 */
export async function adminDeleteGalleryImage(
  imageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("event_gallery")
      .delete()
      .eq("id", imageId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/events");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Save structured content (learning outcomes, objectives, ticker, resources).
 */
export async function adminSaveEventContent(
  eventId: string,
  content: {
    learning_outcomes?: any[];
    objectives?: string[];
    ticker_items?: string[];
    announcements?: string[];
    resources?: any[];
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("events")
      .update({
        ...content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/events");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
