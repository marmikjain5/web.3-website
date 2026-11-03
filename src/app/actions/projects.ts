"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/serverAuth";
import {
  type ProjectRow,
  type ProjectsSettingsRow,
  type ProjectContributor,
  DEFAULT_PROJECTS_SETTINGS,
  INITIAL_EXPLORATION_ENTRIES,
  isValidProjectUrl,
  slugifyTitle,
} from "@/lib/projects";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Helper to extract storage path from a Supabase public URL
function getStoragePathFromUrl(url: string, bucket: string): string | null {
  try {
    const marker = `/${bucket}/`;
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      return decodeURIComponent(url.substring(idx + marker.length));
    }
    return null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// PUBLIC OPERATIONS
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all published and active projects for public display.
 * Falls back gracefully to the initial exploration entries if the
 * database table has not been migrated yet.
 */
export async function getPublicProjects(): Promise<{
  success: boolean;
  data: ProjectRow[];
  error?: string;
  isFallback?: boolean;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "published")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Could not query public.projects table:", error.message);
      // Return initial exploration entries as safe fallback
      const fallbackRows: ProjectRow[] = INITIAL_EXPLORATION_ENTRIES.map((entry, idx) => ({
        ...entry,
        id: `initial-exploration-${idx}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      return {
        success: true,
        data: fallbackRows,
        error: error.message,
        isFallback: true,
      };
    }

    // If table exists but is empty, return empty array so that the empty state renders
    return {
      success: true,
      data: (data as ProjectRow[]) || [],
      isFallback: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load projects";
    console.error("getPublicProjects exception:", message);
    const fallbackRows: ProjectRow[] = INITIAL_EXPLORATION_ENTRIES.map((entry, idx) => ({
      ...entry,
      id: `initial-exploration-${idx}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    return {
      success: true,
      data: fallbackRows,
      error: message,
      isFallback: true,
    };
  }
}

/**
 * Fetch section settings for the Projects section.
 */
export async function getProjectsPageSettings(): Promise<{
  success: boolean;
  data: ProjectsSettingsRow;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects_settings")
      .select("*")
      .eq("id", "default")
      .single();

    if (error || !data) {
      return {
        success: true,
        data: DEFAULT_PROJECTS_SETTINGS,
      };
    }

    return {
      success: true,
      data: data as ProjectsSettingsRow,
    };
  } catch {
    return {
      success: true,
      data: DEFAULT_PROJECTS_SETTINGS,
    };
  }
}

// ─────────────────────────────────────────────────────────────
// ADMIN OPERATIONS (Guarded by requireAdmin)
// ─────────────────────────────────────────────────────────────

/**
 * Admin: Get all projects (published, drafts, archived).
 */
export async function adminGetProjects(): Promise<{
  success: boolean;
  data: ProjectRow[];
  error?: string;
}> {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: (data as ProjectRow[]) || [] };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to load admin projects";
    return { success: false, data: [], error: errorMsg };
  }
}

/**
 * Admin: Create a new project or technology exploration entry.
 */
export async function adminCreateProject(
  formData: FormData
): Promise<{ success: boolean; data?: ProjectRow; error?: string }> {
  let uploadedPath: string | null = null;
  try {
    const { supabase } = await requireAdmin();

    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const category = (formData.get("category") as string)?.trim() || "Technology Exploration";
    const entryType = (formData.get("entry_type") as string) === "project" ? "project" : "exploration";
    const iconName = (formData.get("icon_name") as string)?.trim() || "Layers";
    const symbol = (formData.get("symbol") as string)?.trim() || "◆";
    const status = (formData.get("status") as string) || "published";
    const isActive = formData.get("is_active") !== "false";
    const isFeatured = formData.get("is_featured") === "true";
    const githubUrl = (formData.get("github_url") as string)?.trim() || null;
    const demoUrl = (formData.get("demo_url") as string)?.trim() || null;
    const docsUrl = (formData.get("docs_url") as string)?.trim() || null;

    if (!title) return { success: false, error: "Title is required." };
    if (!description) return { success: false, error: "Description is required." };

    // Validate URLs
    if (!isValidProjectUrl(githubUrl)) return { success: false, error: "Invalid GitHub URL." };
    if (!isValidProjectUrl(demoUrl)) return { success: false, error: "Invalid Live Demo URL." };
    if (!isValidProjectUrl(docsUrl)) return { success: false, error: "Invalid Documentation URL." };

    // Parse tags
    const tagsRaw = (formData.get("tags") as string) || "";
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Parse contributors JSON
    let contributors: ProjectContributor[] = [];
    const contribRaw = formData.get("contributors") as string;
    if (contribRaw) {
      try {
        contributors = JSON.parse(contribRaw);
      } catch {
        contributors = [];
      }
    }

    // Handle Image Upload if provided
    let imageUrl: string | null = null;
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
        return {
          success: false,
          error: "Invalid image format. Allowed: JPEG, PNG, WebP, SVG.",
        };
      }
      if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
        return { success: false, error: "Image size exceeds 5 MB limit." };
      }

      const ext = imageFile.name.split(".").pop() || "png";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      uploadedPath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("project-images")
        .upload(fileName, imageFile, { contentType: imageFile.type, upsert: true });

      if (uploadError) {
        return { success: false, error: `Image upload failed: ${uploadError.message}` };
      }

      const { data: urlData } = supabase.storage
        .from("project-images")
        .getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    // Determine highest sort order
    const { data: lastProject } = await supabase
      .from("projects")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const sortOrder = (lastProject?.sort_order ?? -1) + 1;
    const customSlug = (formData.get("slug") as string)?.trim();
    const slug = customSlug ? slugifyTitle(customSlug) : slugifyTitle(title);

    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          title,
          slug,
          category,
          entry_type: entryType,
          description,
          icon_name: iconName,
          symbol,
          image_url: imageUrl,
          tags,
          status,
          is_active: isActive,
          is_featured: isFeatured,
          sort_order: sortOrder,
          github_url: githubUrl,
          demo_url: demoUrl,
          docs_url: docsUrl,
          contributors,
        },
      ])
      .select("*")
      .single();

    if (error) {
      // Clean up uploaded image if insert failed
      if (uploadedPath) {
        await supabase.storage.from("project-images").remove([uploadedPath]).catch(() => {});
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, data: data as ProjectRow };
  } catch (err: unknown) {
    if (uploadedPath) {
      try {
        const supabase = await createClient();
        await supabase.storage.from("project-images").remove([uploadedPath]);
      } catch {
        // ignore
      }
    }
    const errorMsg = err instanceof Error ? err.message : "Failed to create project";
    return { success: false, error: errorMsg };
  }
}

/**
 * Admin: Update an existing project or exploration entry.
 */
export async function adminUpdateProject(
  id: string,
  formData: FormData
): Promise<{ success: boolean; data?: ProjectRow; error?: string }> {
  let newUploadedPath: string | null = null;
  try {
    const { supabase } = await requireAdmin();

    // Verify existing project
    const { data: existing, error: fetchErr } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return { success: false, error: "Project not found." };
    }

    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const category = (formData.get("category") as string)?.trim() || existing.category;
    const entryType = (formData.get("entry_type") as string) === "project" ? "project" : "exploration";
    const iconName = (formData.get("icon_name") as string)?.trim() || existing.icon_name;
    const symbol = (formData.get("symbol") as string)?.trim() || existing.symbol;
    const status = (formData.get("status") as string) || existing.status;
    const isActive = formData.get("is_active") !== "false";
    const isFeatured = formData.get("is_featured") === "true";
    const githubUrl = (formData.get("github_url") as string)?.trim() || null;
    const demoUrl = (formData.get("demo_url") as string)?.trim() || null;
    const docsUrl = (formData.get("docs_url") as string)?.trim() || null;
    const removeImage = formData.get("remove_image") === "true";

    if (!title) return { success: false, error: "Title is required." };
    if (!description) return { success: false, error: "Description is required." };

    if (!isValidProjectUrl(githubUrl)) return { success: false, error: "Invalid GitHub URL." };
    if (!isValidProjectUrl(demoUrl)) return { success: false, error: "Invalid Live Demo URL." };
    if (!isValidProjectUrl(docsUrl)) return { success: false, error: "Invalid Documentation URL." };

    const tagsRaw = (formData.get("tags") as string) || "";
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    let contributors: ProjectContributor[] = existing.contributors || [];
    const contribRaw = formData.get("contributors") as string;
    if (contribRaw) {
      try {
        contributors = JSON.parse(contribRaw);
      } catch {
        // retain previous
      }
    }

    let imageUrl: string | null = existing.image_url;
    if (removeImage) {
      imageUrl = null;
    }

    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
        return {
          success: false,
          error: "Invalid image format. Allowed: JPEG, PNG, WebP, SVG.",
        };
      }
      if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
        return { success: false, error: "Image size exceeds 5 MB limit." };
      }

      const ext = imageFile.name.split(".").pop() || "png";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      newUploadedPath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("project-images")
        .upload(fileName, imageFile, { contentType: imageFile.type, upsert: true });

      if (uploadError) {
        return { success: false, error: `Image upload failed: ${uploadError.message}` };
      }

      const { data: urlData } = supabase.storage
        .from("project-images")
        .getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    const customSlug = (formData.get("slug") as string)?.trim();
    const slug = customSlug ? slugifyTitle(customSlug) : existing.slug || slugifyTitle(title);

    const updatePayload = {
      title,
      slug,
      category,
      entry_type: entryType,
      description,
      icon_name: iconName,
      symbol,
      image_url: imageUrl,
      tags,
      status,
      is_active: isActive,
      is_featured: isFeatured,
      github_url: githubUrl,
      demo_url: demoUrl,
      docs_url: docsUrl,
      contributors,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("projects")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      if (newUploadedPath) {
        await supabase.storage.from("project-images").remove([newUploadedPath]).catch(() => {});
      }
      return { success: false, error: error.message };
    }

    // If update succeeded and a new image was uploaded (or image removed),
    // safely delete old image if it was hosted in project-images
    if ((newUploadedPath || removeImage) && existing.image_url) {
      const oldPath = getStoragePathFromUrl(existing.image_url, "project-images");
      if (oldPath && oldPath !== newUploadedPath) {
        await supabase.storage.from("project-images").remove([oldPath]).catch(() => {});
      }
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, data: data as ProjectRow };
  } catch (err: unknown) {
    if (newUploadedPath) {
      try {
        const supabase = await createClient();
        await supabase.storage.from("project-images").remove([newUploadedPath]);
      } catch {
        // ignore
      }
    }
    const errorMsg = err instanceof Error ? err.message : "Failed to update project";
    return { success: false, error: errorMsg };
  }
}

/**
 * Admin: Delete a project.
 */
export async function adminDeleteProject(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await requireAdmin();

    const { data: project } = await supabase
      .from("projects")
      .select("image_url")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return { success: false, error: error.message };

    // Clean up image if hosted in project-images
    if (project?.image_url) {
      const storagePath = getStoragePathFromUrl(project.image_url, "project-images");
      if (storagePath) {
        await supabase.storage.from("project-images").remove([storagePath]).catch(() => {});
      }
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to delete project";
    return { success: false, error: errorMsg };
  }
}

/**
 * Admin: Quick toggle publish / draft status.
 */
export async function adminTogglePublish(
  id: string,
  newStatus: "published" | "draft"
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("projects")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to update publication status";
    return { success: false, error: errorMsg };
  }
}

/**
 * Admin: Quick toggle active / inactive status.
 */
export async function adminToggleActive(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("projects")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to update active status";
    return { success: false, error: errorMsg };
  }
}

/**
 * Admin: Reorder project cards by an array of ordered project IDs.
 */
export async function adminReorderProjects(
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await requireAdmin();

    const updates = orderedIds.map((id, index) =>
      supabase
        .from("projects")
        .update({ sort_order: index, updated_at: new Date().toISOString() })
        .eq("id", id)
    );

    const results = await Promise.all(updates);
    const failure = results.find((r) => r.error);
    if (failure?.error) {
      return { success: false, error: failure.error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to reorder projects";
    return { success: false, error: errorMsg };
  }
}

/**
 * Admin: Update public projects section settings (heading, subtitle, empty state).
 */
export async function adminUpdateProjectsPageSettings(
  settings: Partial<ProjectsSettingsRow>
): Promise<{ success: boolean; data?: ProjectsSettingsRow; error?: string }> {
  try {
    const { supabase } = await requireAdmin();

    const payload = {
      id: "default",
      heading: settings.heading?.trim() || DEFAULT_PROJECTS_SETTINGS.heading,
      subtitle: settings.subtitle?.trim() || DEFAULT_PROJECTS_SETTINGS.subtitle,
      empty_heading: settings.empty_heading?.trim() || DEFAULT_PROJECTS_SETTINGS.empty_heading,
      empty_description:
        settings.empty_description?.trim() || DEFAULT_PROJECTS_SETTINGS.empty_description,
      empty_status: settings.empty_status?.trim() || DEFAULT_PROJECTS_SETTINGS.empty_status,
      cta_text: settings.cta_text?.trim() || DEFAULT_PROJECTS_SETTINGS.cta_text,
      cta_url: settings.cta_url?.trim() || DEFAULT_PROJECTS_SETTINGS.cta_url,
      show_cta: settings.show_cta ?? DEFAULT_PROJECTS_SETTINGS.show_cta,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("projects_settings")
      .upsert(payload)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, data: data as ProjectsSettingsRow };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to update project settings";
    return { success: false, error: errorMsg };
  }
}

