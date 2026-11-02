"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/serverAuth";
import {
  type SubmissionCategory,
  type CategorySettingsRow,
  type PublicSubmissionPortalSettings,
  DEFAULT_CATEGORY_SETTINGS,
  validateGoogleFormUrl,
} from "@/lib/submissions";

/**
 * Public Server Action to fetch active submission portal settings.
 * Queries the security-definer view public.public_submission_portal_settings.
 * Falls back safely to default project_proposal settings if the database
 * has not yet been migrated.
 */
export async function getPublicSubmissionPortalSettings(): Promise<{
  success: boolean;
  data: PublicSubmissionPortalSettings;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("public_submission_portal_settings")
      .select("*")
      .single();

    if (error || !data) {
      // Safe fallback if database view does not exist yet
      return {
        success: true,
        data: {
          active_category: "project_proposal",
          ...DEFAULT_CATEGORY_SETTINGS.project_proposal,
        },
      };
    }

    return {
      success: true,
      data: data as PublicSubmissionPortalSettings,
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : "Failed to load submission portal settings";
    return {
      success: true,
      data: {
        active_category: "project_proposal",
        ...DEFAULT_CATEGORY_SETTINGS.project_proposal,
      },
      error: errorMsg,
    };
  }
}

/**
 * Admin Server Action to fetch full configuration for all 4 categories
 * and the active category singleton.
 */
export async function adminGetSubmissionPortalSettings(): Promise<{
  success: boolean;
  active_category: SubmissionCategory;
  categories: Record<SubmissionCategory, CategorySettingsRow>;
  error?: string;
}> {
  try {
    const { supabase } = await requireAdmin();

    // 1. Fetch active category from submission_portal_config
    const { data: configData, error: configError } = await supabase
      .from("submission_portal_config")
      .select("active_category")
      .eq("id", "portal_config")
      .maybeSingle();

    const active_category: SubmissionCategory =
      configData?.active_category || "project_proposal";

    // 2. Fetch all category settings
    const { data: catRows, error: catError } = await supabase
      .from("submission_category_settings")
      .select("*");

    const categories: Record<SubmissionCategory, CategorySettingsRow> = {
      project_proposal: { ...DEFAULT_CATEGORY_SETTINGS.project_proposal },
      join_project: { ...DEFAULT_CATEGORY_SETTINGS.join_project },
      events: { ...DEFAULT_CATEGORY_SETTINGS.events },
      hackathons: { ...DEFAULT_CATEGORY_SETTINGS.hackathons },
    };

    if (catRows && !catError) {
      for (const row of catRows) {
        if (row.category in categories) {
          categories[row.category as SubmissionCategory] = {
            ...categories[row.category as SubmissionCategory],
            ...row,
          };
        }
      }
    }

    // Detect if tables are missing in Supabase schema cache
    const isMissingTable =
      configError?.message?.includes("schema cache") ||
      catError?.message?.includes("schema cache") ||
      configError?.code === "PGRST205" ||
      catError?.code === "PGRST205";

    if (isMissingTable) {
      return {
        success: false,
        active_category,
        categories,
        error:
          "Database migration pending: Tables 'submission_portal_config' and 'submission_category_settings' do not exist in the connected Supabase database yet. Please apply supabase/migrations/20261102_google_forms_submission_portal.sql via Supabase SQL Editor.",
      };
    }

    if (configError || catError) {
      return {
        success: false,
        active_category,
        categories,
        error: configError?.message || catError?.message || "Failed to load database settings",
      };
    }

    return {
      success: true,
      active_category,
      categories,
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Unauthorized or database query failure";
    return {
      success: false,
      active_category: "project_proposal",
      categories: { ...DEFAULT_CATEGORY_SETTINGS },
      error: errorMsg,
    };
  }
}

/**
 * Admin Server Action to switch the active submission category singleton.
 */
export async function adminSetActiveCategory(
  category: SubmissionCategory
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireAdmin();

    const VALID_CATEGORIES: SubmissionCategory[] = [
      "project_proposal",
      "join_project",
      "events",
      "hackathons",
    ];

    if (!VALID_CATEGORIES.includes(category)) {
      return { success: false, error: `Invalid category: "${category}"` };
    }

    const { error } = await supabase
      .from("submission_portal_config")
      .update({
        active_category: category,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq("id", "portal_config");

    if (error) {
      if (error.message?.includes("schema cache") || error.code === "PGRST205") {
        return {
          success: false,
          error:
            "Database table 'submission_portal_config' does not exist yet. Please run supabase/migrations/20261102_google_forms_submission_portal.sql in your Supabase SQL Editor first.",
        };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/join");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Failed to set active category";
    return { success: false, error: errorMsg };
  }
}

/**
 * Admin Server Action to update configuration for a specific category.
 */
export async function adminUpdateCategorySettings(
  category: SubmissionCategory,
  payload: Partial<CategorySettingsRow>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireAdmin();

    const VALID_CATEGORIES: SubmissionCategory[] = [
      "project_proposal",
      "join_project",
      "events",
      "hackathons",
    ];

    if (!VALID_CATEGORIES.includes(category)) {
      return { success: false, error: `Invalid category: "${category}"` };
    }

    // Validate URL if provided or changed
    if ("google_form_url" in payload) {
      const urlCheck = validateGoogleFormUrl(payload.google_form_url);
      if (!urlCheck.valid) {
        return { success: false, error: urlCheck.error || "Invalid Google Form URL" };
      }
      payload.google_form_url = urlCheck.cleanUrl;
    }

    // Trim string fields if present
    const stringKeys: (keyof CategorySettingsRow)[] = [
      "left_heading",
      "checklist_label_1",
      "checklist_label_2",
      "checklist_label_3",
      "checklist_label_4",
      "right_heading",
      "right_subtitle",
      "card1_heading",
      "card1_desc",
      "card2_heading",
      "card2_desc",
      "closing_text",
      "cta_label",
      "join_heading",
      "join_subtitle",
    ];

    const cleanPayload: Record<string, unknown> = {
      category,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    };

    if ("is_open" in payload && typeof payload.is_open === "boolean") {
      cleanPayload.is_open = payload.is_open;
    }

    if ("google_form_url" in payload) {
      cleanPayload.google_form_url = payload.google_form_url;
    }

    for (const key of stringKeys) {
      const val = payload[key];
      if (typeof val === "string") {
        cleanPayload[key] = val.trim();
      }
    }

    const { error } = await supabase
      .from("submission_category_settings")
      .update(cleanPayload)
      .eq("category", category);

    if (error) {
      if (error.message?.includes("schema cache") || error.code === "PGRST205") {
        return {
          success: false,
          error:
            "Database table 'submission_portal_config' does not exist yet. Please run supabase/migrations/20261102_google_forms_submission_portal.sql in your Supabase SQL Editor first.",
        };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/join");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Failed to update category settings";
    return { success: false, error: errorMsg };
  }
}
