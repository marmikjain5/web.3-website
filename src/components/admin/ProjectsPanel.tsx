"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  adminGetProjects,
  adminCreateProject,
  adminUpdateProject,
  adminDeleteProject,
  adminTogglePublish,
  adminToggleActive,
  adminReorderProjects,
  adminUpdateProjectsPageSettings,
  getProjectsPageSettings,
} from "@/app/actions/projects";
import {
  type ProjectRow,
  type ProjectsSettingsRow,
  type ProjectContributor,
  type EntryType,
  type ProjectStatus,
  CYBER_SYMBOLS,
  AVAILABLE_ICONS,
  DEFAULT_PROJECTS_SETTINGS,
  isValidProjectUrl,
  slugifyTitle,
} from "@/lib/projects";
import {
  Plus,
  Settings,
  Search,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  ExternalLink,
  BookOpen,
  Sparkles,
  Layers,
  Blocks,
  BrainCircuit,
  Code2,
  Shield,
  Trophy,
  GitBranch,
  Globe,
  Database,
  Terminal,
  Rocket,
  Smartphone,
  Network,
  Server,
  Upload,
  AlertCircle,
  Loader2,
  Users,
} from "lucide-react";

// Icon preview helper
function IconPreview({ iconName, className = "w-4 h-4" }: { iconName?: string | null; className?: string }) {
  switch (iconName) {
    case "Blocks":
      return <Blocks className={className} />;
    case "BrainCircuit":
      return <BrainCircuit className={className} />;
    case "Code2":
      return <Code2 className={className} />;
    case "Shield":
      return <Shield className={className} />;
    case "Trophy":
      return <Trophy className={className} />;
    case "GitBranch":
      return <GitBranch className={className} />;
    case "Globe":
      return <Globe className={className} />;
    case "Database":
      return <Database className={className} />;
    case "Terminal":
      return <Terminal className={className} />;
    case "Rocket":
      return <Rocket className={className} />;
    case "Sparkles":
      return <Sparkles className={className} />;
    case "Smartphone":
      return <Smartphone className={className} />;
    case "Network":
      return <Network className={className} />;
    case "Server":
      return <Server className={className} />;
    case "Layers":
    default:
      return <Layers className={className} />;
  }
}

export default function ProjectsPanel() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [settings, setSettings] = useState<ProjectsSettingsRow>(DEFAULT_PROJECTS_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "exploration" | "project" | "published" | "draft" | "archived">("all");
  const [editingProject, setEditingProject] = useState<ProjectRow | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [projRes, setRes] = await Promise.all([adminGetProjects(), getProjectsPageSettings()]);
    if (projRes.success) {
      setProjects(projRes.data);
    } else if (projRes.error) {
      setFeedback({ type: "error", text: projRes.error });
    }
    if (setRes.success) {
      setSettings(setRes.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Quick toggle publish/draft
  const handleTogglePublish = async (project: ProjectRow) => {
    const newStatus: "published" | "draft" = project.status === "published" ? "draft" : "published";
    const res = await adminTogglePublish(project.id, newStatus);
    if (res.success) {
      showToast("success", `Project marked as ${newStatus}.`);
      loadData();
    } else {
      showToast("error", res.error || "Failed to update status.");
    }
  };

  // Quick toggle active/inactive
  const handleToggleActive = async (project: ProjectRow) => {
    const res = await adminToggleActive(project.id, !project.is_active);
    if (res.success) {
      showToast("success", `Project ${!project.is_active ? "activated" : "deactivated"}.`);
      loadData();
    } else {
      showToast("error", res.error || "Failed to toggle active state.");
    }
  };

  // Reordering: move up or down
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const newOrder = [...projects];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    setProjects(newOrder);
    const orderedIds = newOrder.map((p) => p.id);
    const res = await adminReorderProjects(orderedIds);
    if (res.success) {
      showToast("success", "Display order updated.");
    } else {
      showToast("error", res.error || "Failed to update order.");
      loadData();
    }
  };

  // Delete project
  const confirmDelete = async () => {
    if (!deletingId) return;
    const res = await adminDeleteProject(deletingId);
    setDeletingId(null);
    if (res.success) {
      showToast("success", "Entry deleted successfully.");
      loadData();
    } else {
      showToast("error", res.error || "Failed to delete entry.");
    }
  };

  // Filter & Search
  const filteredProjects = projects.filter((p) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "exploration" && p.entry_type === "exploration") ||
      (filter === "project" && p.entry_type === "project") ||
      (filter === "published" && p.status === "published") ||
      (filter === "draft" && p.status === "draft") ||
      (filter === "archived" && p.status === "archived");

    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.title.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.tags.some((t) => t.toLowerCase().includes(query));

    return matchesFilter && matchesSearch;
  });

  // Statistics
  const totalCount = projects.length;
  const publishedCount = projects.filter((p) => p.status === "published").length;
  const draftCount = projects.filter((p) => p.status === "draft").length;
  const explorationCount = projects.filter((p) => p.entry_type === "exploration").length;
  const studentProjectCount = projects.filter((p) => p.entry_type === "project").length;

  return (
    <div className="space-y-8">
      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg font-mono text-sm border backdrop-blur-md shadow-lg transition-all ${
            feedback.type === "success"
              ? "bg-[#E50914]/10 border-[#E50914]/30 text-[#E50914]"
              : "bg-red-500/10 border-red-500/30 text-red-500"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl border border-border bg-foreground/[0.02]">
          <span className="block font-mono text-[10px] uppercase text-foreground/50 tracking-wider">Total Entries</span>
          <span className="font-mono text-2xl font-black text-foreground">{totalCount}</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-foreground/[0.02]">
          <span className="block font-mono text-[10px] uppercase text-foreground/50 tracking-wider">Published</span>
          <span className="font-mono text-2xl font-black text-emerald-500">{publishedCount}</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-foreground/[0.02]">
          <span className="block font-mono text-[10px] uppercase text-foreground/50 tracking-wider">Drafts</span>
          <span className="font-mono text-2xl font-black text-amber-500">{draftCount}</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-foreground/[0.02]">
          <span className="block font-mono text-[10px] uppercase text-foreground/50 tracking-wider">Exploration</span>
          <span className="font-mono text-2xl font-black text-[#E50914]">{explorationCount}</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-foreground/[0.02] col-span-2 sm:col-span-1">
          <span className="block font-mono text-[10px] uppercase text-foreground/50 tracking-wider">Student Projects</span>
          <span className="font-mono text-2xl font-black text-foreground">{studentProjectCount}</span>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <input
            type="text"
            placeholder="Search projects, categories or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-foreground/[0.03] border border-border rounded-lg font-mono text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-[#E50914] transition-colors"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-4 py-2 border border-border bg-foreground/[0.03] hover:border-[#E50914] hover:text-[#E50914] text-foreground/80 font-mono text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            title="Configure Section Heading and Empty State"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Section Settings</span>
          </button>

          <button
            onClick={() => {
              setEditingProject(null);
              setShowFormModal(true);
            }}
            className="px-5 py-2 bg-[#E50914] hover:bg-[#b80710] text-white font-mono text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-foreground/[0.03] border border-border w-fit text-xs font-mono">
        {(
          [
            { id: "all", label: `All (${totalCount})` },
            { id: "exploration", label: `Exploration (${explorationCount})` },
            { id: "project", label: `Projects (${studentProjectCount})` },
            { id: "published", label: `Published (${publishedCount})` },
            { id: "draft", label: `Drafts (${draftCount})` },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              filter === t.id
                ? "bg-[#E50914] text-white font-bold shadow-sm"
                : "text-foreground/60 hover:text-foreground hover:bg-foreground/[0.04]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="text-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#E50914] mx-auto mb-2" />
          <p className="font-mono text-xs text-foreground/50">Loading showcase entries...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 border border-border rounded-xl bg-foreground/[0.01]">
          <p className="font-mono text-sm text-foreground/40 mb-2">No entries matching the current filter or search.</p>
          <button
            onClick={() => {
              setFilter("all");
              setSearch("");
            }}
            className="font-mono text-xs text-[#E50914] hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project, index) => {
            const isExploration = project.entry_type === "exploration";

            return (
              <div
                key={project.id}
                className="p-4 sm:p-5 rounded-xl border border-border bg-card hover:border-[#E50914]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Left: Reorder & Symbol/Thumb */}
                <div className="flex items-center gap-3">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      className="p-1 rounded text-foreground/30 hover:text-[#E50914] disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(index, "down")}
                      disabled={index === projects.length - 1}
                      className="p-1 rounded text-foreground/30 hover:text-[#E50914] disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Symbol or Thumbnail */}
                  <div className="w-12 h-12 rounded-lg border border-border bg-foreground/[0.03] flex items-center justify-center shrink-0 overflow-hidden relative text-[#E50914]">
                    {project.image_url ? (
                      <Image
                        src={project.image_url}
                        alt={project.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <span className="text-xl font-bold font-mono">{project.symbol || "◆"}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-mono font-bold text-sm text-foreground">{project.title}</h3>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          isExploration
                            ? "bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/20"
                            : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                        }`}
                      >
                        {isExploration ? "Exploration" : "Student Project"}
                      </span>
                      {project.is_featured && (
                        <span className="text-[9px] font-mono text-amber-500 font-bold uppercase flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> Featured
                        </span>
                      )}
                    </div>

                    <p className="font-mono text-xs text-foreground/60 line-clamp-1 mt-0.5 max-w-xl">
                      {project.description}
                    </p>

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {project.tags.slice(0, 4).map((t) => (
                          <span key={t} className="text-[9px] font-mono text-foreground/50 bg-foreground/[0.04] px-1.5 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                        {project.tags.length > 4 && (
                          <span className="text-[9px] font-mono text-foreground/40">
                            +{project.tags.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Status Pills & Action Buttons */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                  {/* Status Badges */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePublish(project)}
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-md border font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        project.status === "published"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
                      }`}
                      title="Click to toggle publish status"
                    >
                      {project.status === "published" ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span className="uppercase">{project.status}</span>
                    </button>

                    <button
                      onClick={() => handleToggleActive(project)}
                      className={`text-[10px] font-mono px-2 py-1 rounded-md border transition-all cursor-pointer ${
                        project.is_active
                          ? "bg-foreground/[0.05] text-foreground/80 border-border hover:border-foreground/30"
                          : "bg-red-500/10 text-red-500 border-red-500/30"
                      }`}
                      title="Toggle active display"
                    >
                      {project.is_active ? "ACTIVE" : "INACTIVE"}
                    </button>
                  </div>

                  {/* Edit & Delete */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingProject(project);
                        setShowFormModal(true);
                      }}
                      className="p-2 rounded-lg border border-border bg-foreground/[0.02] hover:border-[#E50914] hover:text-[#E50914] transition-colors cursor-pointer"
                      title="Edit project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(project.id)}
                      className="p-2 rounded-lg border border-border bg-foreground/[0.02] hover:border-red-500 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Form Modal */}
      {showFormModal && (
        <ProjectFormModal
          project={editingProject}
          onClose={() => {
            setShowFormModal(false);
            setEditingProject(null);
          }}
          onSuccess={(text) => {
            setShowFormModal(false);
            setEditingProject(null);
            showToast("success", text);
            loadData();
          }}
        />
      )}

      {/* Section Settings Modal */}
      {showSettingsModal && (
        <ProjectsSettingsModal
          settings={settings}
          onClose={() => setShowSettingsModal(false)}
          onSuccess={(text) => {
            setShowSettingsModal(false);
            showToast("success", text);
            loadData();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 shadow-2xl relative">
            <h3 className="font-mono text-base font-bold text-foreground mb-2">Confirm Delete</h3>
            <p className="font-mono text-xs text-foreground/70 leading-relaxed mb-6">
              Are you sure you want to delete this showcase entry? Any associated uploaded thumbnail image will also be removed. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border border-border rounded-lg font-mono text-xs text-foreground/70 hover:bg-foreground/[0.05] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold rounded-lg cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PROJECT FORM MODAL
// ─────────────────────────────────────────────────────────────

interface ProjectFormModalProps {
  project?: ProjectRow | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

function ProjectFormModal({ project, onClose, onSuccess }: ProjectFormModalProps) {
  const isEditing = Boolean(project);

  const [title, setTitle] = useState(project?.title || "");
  const [slug, setSlug] = useState(project?.slug || "");
  const [category, setCategory] = useState(project?.category || "Technology Exploration");
  const [entryType, setEntryType] = useState<EntryType>(project?.entry_type || "exploration");
  const [description, setDescription] = useState(project?.description || "");
  const [iconName, setIconName] = useState(project?.icon_name || "Layers");
  const [symbol, setSymbol] = useState(project?.symbol || "◆");
  const [status, setStatus] = useState<ProjectStatus>(project?.status || "published");
  const [isActive, setIsActive] = useState(project?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(project?.is_featured ?? false);

  // Tags manager
  const [tags, setTags] = useState<string[]>(project?.tags || []);
  const [tagInput, setTagInput] = useState("");

  // Links
  const [githubUrl, setGithubUrl] = useState(project?.github_url || "");
  const [demoUrl, setDemoUrl] = useState(project?.demo_url || "");
  const [docsUrl, setDocsUrl] = useState(project?.docs_url || "");

  // Contributors
  const [contributors, setContributors] = useState<ProjectContributor[]>(project?.contributors || []);
  const [contribName, setContribName] = useState("");
  const [contribRole, setContribRole] = useState("");
  const [contribGithub, setContribGithub] = useState("");

  // Image Upload & Preview
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(project?.image_url || null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-slug on title change if not manually edited
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing || !project?.slug) {
      setSlug(slugifyTitle(val));
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddContributor = () => {
    if (!contribName.trim()) return;
    setContributors([
      ...contributors,
      {
        name: contribName.trim(),
        role: contribRole.trim() || undefined,
        github: contribGithub.trim() || undefined,
      },
    ]);
    setContribName("");
    setContribRole("");
    setContribGithub("");
  };

  const handleRemoveContributor = (index: number) => {
    setContributors(contributors.filter((_, idx) => idx !== index));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size exceeds 5 MB limit.");
        return;
      }
      setImageFile(file);
      setRemoveImage(false);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveExistingImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (targetStatus?: ProjectStatus) => {
    setError(null);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }
    if (!isValidProjectUrl(githubUrl)) {
      setError("Invalid GitHub URL.");
      return;
    }
    if (!isValidProjectUrl(demoUrl)) {
      setError("Invalid Live Demo URL.");
      return;
    }
    if (!isValidProjectUrl(docsUrl)) {
      setError("Invalid Documentation URL.");
      return;
    }

    setSaving(true);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("slug", slug.trim() || slugifyTitle(title));
    formData.append("category", category.trim());
    formData.append("entry_type", entryType);
    formData.append("description", description.trim());
    formData.append("icon_name", iconName);
    formData.append("symbol", symbol);
    formData.append("tags", tags.join(","));
    formData.append("status", targetStatus || status);
    formData.append("is_active", String(isActive));
    formData.append("is_featured", String(isFeatured));
    formData.append("github_url", githubUrl.trim());
    formData.append("demo_url", demoUrl.trim());
    formData.append("docs_url", docsUrl.trim());
    formData.append("contributors", JSON.stringify(contributors));

    if (imageFile) {
      formData.append("image", imageFile);
    }
    if (removeImage) {
      formData.append("remove_image", "true");
    }

    let res;
    if (isEditing && project) {
      res = await adminUpdateProject(project.id, formData);
    } else {
      res = await adminCreateProject(formData);
    }

    setSaving(false);

    if (res.success) {
      onSuccess(isEditing ? "Project updated successfully!" : "Project created successfully!");
    } else {
      setError(res.error || "Failed to save project.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="max-w-2xl w-full bg-card border border-border rounded-2xl shadow-2xl overflow-hidden my-8 relative flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-border flex items-center justify-between shrink-0 bg-foreground/[0.02]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#E50914] rounded-full animate-pulse" />
            <h2 className="font-mono text-base font-bold text-foreground">
              {isEditing ? "Edit Showcase Entry" : "New Showcase Entry"}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/[0.05] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto font-mono text-xs flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Entry Type Selector */}
          <div>
            <label className="block text-[11px] font-bold text-foreground/70 uppercase mb-2">Entry Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEntryType("exploration");
                  if (category === "Student Project") setCategory("Technology Exploration");
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  entryType === "exploration"
                    ? "bg-[#E50914]/10 border-[#E50914] text-foreground font-bold"
                    : "bg-foreground/[0.02] border-border text-foreground/60 hover:border-foreground/20"
                }`}
              >
                <span className="block text-xs font-bold text-[#E50914] uppercase">Technology Exploration</span>
                <span className="text-[10px] text-foreground/50 font-normal">
                  Curriculum track, research focus, or exploration area.
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEntryType("project");
                  if (category === "Technology Exploration") setCategory("Campus Project");
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  entryType === "project"
                    ? "bg-[#E50914]/10 border-[#E50914] text-foreground font-bold"
                    : "bg-foreground/[0.02] border-border text-foreground/60 hover:border-foreground/20"
                }`}
              >
                <span className="block text-xs font-bold text-[#E50914] uppercase">Student Project</span>
                <span className="text-[10px] text-foreground/50 font-normal">
                  Live dApp, hackathon winner, or student-built codebase.
                </span>
              </button>
            </div>
          </div>

          {/* Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-foreground/70 uppercase mb-1">
                Title <span className="text-[#E50914]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. BLOCKCHAIN or CAMPUS PAY"
                className="w-full px-3.5 py-2 bg-foreground/[0.03] border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-[#E50914]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-foreground/70 uppercase mb-1">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugifyTitle(e.target.value))}
                placeholder="e.g. blockchain"
                className="w-full px-3.5 py-2 bg-foreground/[0.03] border border-border rounded-lg text-xs text-foreground/70 focus:outline-none focus:border-[#E50914]"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-bold text-foreground/70 uppercase mb-1">Category Badge</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Technology Exploration, Micro-Payments, DeFi"
              className="w-full px-3.5 py-2 bg-foreground/[0.03] border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-[#E50914]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-foreground/70 uppercase mb-1">
              Description <span className="text-[#E50914]">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Clear summary of what this exploration area or project entails..."
              className="w-full px-3.5 py-2 bg-foreground/[0.03] border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-[#E50914] leading-relaxed resize-none"
            />
          </div>

          {/* Symbol & Icon Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-foreground/70 uppercase mb-1">Cyber Symbol</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {CYBER_SYMBOLS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSymbol(s)}
                    className={`w-7 h-7 rounded border font-mono text-sm flex items-center justify-center cursor-pointer transition-colors ${
                      symbol === s
                        ? "bg-[#E50914] text-white border-[#E50914]"
                        : "bg-foreground/[0.03] border-border text-foreground/70 hover:border-[#E50914]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-foreground/70 uppercase mb-1">Icon</label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded border border-border bg-foreground/[0.03] flex items-center justify-center text-[#E50914] shrink-0">
                  <IconPreview iconName={iconName} className="w-4 h-4" />
                </div>
                <select
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  className="w-full px-3 py-2 bg-foreground/[0.03] border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-[#E50914] cursor-pointer"
                >
                  {AVAILABLE_ICONS.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Thumbnail Image Upload */}
          <div>
            <label className="block text-[11px] font-bold text-foreground/70 uppercase mb-1">
              Thumbnail / Banner (Supabase Storage)
            </label>
            <div className="p-4 border border-dashed border-border rounded-xl bg-foreground/[0.01] flex flex-col sm:flex-row items-center gap-4">
              {imagePreview ? (
                <div className="relative w-28 h-20 rounded-lg overflow-hidden border border-border bg-foreground/[0.05] shrink-0">
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-28 h-20 rounded-lg border border-border bg-foreground/[0.03] flex items-center justify-center text-foreground/30 shrink-0">
                  <Upload className="w-6 h-6" />
                </div>
              )}

              <div className="space-y-1.5 flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleImageChange}
                  className="text-[11px] text-foreground/70 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-mono file:bg-[#E50914] file:text-white file:cursor-pointer"
                />
                <p className="text-[10px] text-foreground/40">JPEG, PNG, WebP or SVG up to 5 MB.</p>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveExistingImage}
                    className="text-[10px] text-red-500 hover:underline cursor-pointer"
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Technology Tags */}
          <div>
            <label className="block text-[11px] font-bold text-foreground/70 uppercase mb-1">Technology Tags</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="e.g. Solidity, Next.js, PyTorch (Press Enter)"
                className="flex-1 px-3.5 py-1.5 bg-foreground/[0.03] border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-[#E50914]"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-foreground/[0.05] hover:bg-foreground/[0.1] border border-border rounded-lg text-xs text-foreground font-bold cursor-pointer"
              >
                Add
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-foreground/[0.04] border border-border text-[10px] text-foreground/80 font-bold"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-foreground/40 hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Links (for both exploration and projects) */}
          <div className="space-y-3 pt-2 border-t border-border">
            <span className="block text-[11px] font-bold text-foreground/70 uppercase">
              Action &amp; Documentation Links
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-foreground/50 uppercase mb-0.5">GitHub URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-1.5 bg-foreground/[0.03] border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-[#E50914]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-foreground/50 uppercase mb-0.5">Live Demo URL</label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 bg-foreground/[0.03] border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-[#E50914]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-foreground/50 uppercase mb-0.5">Documentation URL</label>
                <input
                  type="url"
                  value={docsUrl}
                  onChange={(e) => setDocsUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 bg-foreground/[0.03] border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-[#E50914]"
                />
              </div>
            </div>
          </div>

          {/* Student Project Contributors (relevant when entry_type === 'project') */}
          {entryType === "project" && (
            <div className="space-y-3 pt-2 border-t border-border">
              <span className="block text-[11px] font-bold text-foreground/70 uppercase">Project Contributors</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Student Name *"
                  value={contribName}
                  onChange={(e) => setContribName(e.target.value)}
                  className="px-3 py-1.5 bg-foreground/[0.03] border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-[#E50914]"
                />
                <input
                  type="text"
                  placeholder="Role (e.g. Lead, Smart Contracts)"
                  value={contribRole}
                  onChange={(e) => setContribRole(e.target.value)}
                  className="px-3 py-1.5 bg-foreground/[0.03] border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-[#E50914]"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="GitHub username"
                    value={contribGithub}
                    onChange={(e) => setContribGithub(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-foreground/[0.03] border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-[#E50914]"
                  />
                  <button
                    type="button"
                    onClick={handleAddContributor}
                    className="px-3 py-1.5 bg-foreground/[0.05] hover:bg-foreground/[0.1] border border-border rounded-lg text-xs font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {contributors.length > 0 && (
                <div className="space-y-1.5">
                  {contributors.map((c, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-foreground/[0.02] border border-border text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-[#E50914]" />
                        <span className="font-bold text-foreground">{c.name}</span>
                        {c.role && <span className="text-foreground/50 text-[10px]">({c.role})</span>}
                        {c.github && <span className="text-foreground/40 text-[10px]">@{c.github}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveContributor(idx)}
                        className="text-foreground/40 hover:text-red-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Publishing Controls */}
          <div className="pt-2 border-t border-border flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-border accent-[#E50914] w-3.5 h-3.5"
                />
                <span className="text-xs text-foreground/80 font-bold">Active in Showcase</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-border accent-[#E50914] w-3.5 h-3.5"
                />
                <span className="text-xs text-foreground/80 font-bold">Mark as Featured</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[10px] text-foreground/50 uppercase">Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="px-2.5 py-1 bg-foreground/[0.03] border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-[#E50914] cursor-pointer"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-foreground/[0.02] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 sm:py-2 border border-border rounded-lg font-mono text-xs text-foreground/70 hover:bg-foreground/[0.05] transition-colors cursor-pointer min-h-[44px] sm:min-h-0 flex items-center justify-center"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              disabled={saving}
              className="px-4 py-2.5 sm:py-2 border border-border bg-foreground/[0.03] hover:border-amber-500 hover:text-amber-500 font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer min-h-[44px] sm:min-h-0 flex items-center justify-center"
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => handleSubmit("published")}
              disabled={saving}
              className="px-5 py-2.5 sm:py-2 bg-[#E50914] hover:bg-[#b80710] text-white font-mono text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 min-h-[44px] sm:min-h-0"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>{isEditing ? "Save & Publish" : "Publish Entry"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PROJECTS SECTION SETTINGS MODAL
// ─────────────────────────────────────────────────────────────

interface ProjectsSettingsModalProps {
  settings: ProjectsSettingsRow;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

function ProjectsSettingsModal({ settings, onClose, onSuccess }: ProjectsSettingsModalProps) {
  const [heading, setHeading] = useState(settings.heading);
  const [subtitle, setSubtitle] = useState(settings.subtitle);
  const [emptyHeading, setEmptyHeading] = useState(settings.empty_heading);
  const [emptyDesc, setEmptyDesc] = useState(settings.empty_description);
  const [emptyStatus, setEmptyStatus] = useState(settings.empty_status);
  const [ctaText, setCtaText] = useState(settings.cta_text || "JOIN THE BUILDER SQUAD");
  const [ctaUrl, setCtaUrl] = useState(settings.cta_url || "/join");
  const [showCta, setShowCta] = useState(settings.show_cta);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await adminUpdateProjectsPageSettings({
      heading,
      subtitle,
      empty_heading: emptyHeading,
      empty_description: emptyDesc,
      empty_status: emptyStatus,
      cta_text: ctaText,
      cta_url: ctaUrl,
      show_cta: showCta,
    });

    setSaving(false);

    if (res.success) {
      onSuccess("Section settings updated successfully!");
    } else {
      setError(res.error || "Failed to update settings.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="max-w-xl w-full bg-card border border-border rounded-2xl shadow-2xl overflow-hidden my-8 relative flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-border flex items-center justify-between shrink-0 bg-foreground/[0.02]">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#E50914]" />
            <h2 className="font-mono text-base font-bold text-foreground">Projects Showcase Configuration</h2>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 overflow-y-auto font-mono text-xs flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-foreground/70 uppercase mb-1">Section Heading</label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="w-full px-3.5 py-2 bg-foreground/[0.03] border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-[#E50914]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-foreground/70 uppercase mb-1">Section Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-foreground/[0.03] border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-[#E50914]"
              required
            />
          </div>

          <div className="pt-3 border-t border-border space-y-3">
            <span className="block text-[11px] font-bold text-foreground/70 uppercase">
              Empty State Content (When 0 Entries Published)
            </span>

            <div>
              <label className="block text-[10px] text-foreground/50 uppercase mb-0.5">Empty State Heading</label>
              <input
                type="text"
                value={emptyHeading}
                onChange={(e) => setEmptyHeading(e.target.value)}
                className="w-full px-3 py-1.5 bg-foreground/[0.03] border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-[#E50914]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-foreground/50 uppercase mb-0.5">Empty State Description</label>
              <textarea
                rows={2}
                value={emptyDesc}
                onChange={(e) => setEmptyDesc(e.target.value)}
                className="w-full px-3 py-1.5 bg-foreground/[0.03] border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-[#E50914] resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-foreground/50 uppercase mb-0.5">Status Badge Label</label>
              <input
                type="text"
                value={emptyStatus}
                onChange={(e) => setEmptyStatus(e.target.value)}
                className="w-full px-3 py-1.5 bg-foreground/[0.03] border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-[#E50914]"
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-foreground/70 uppercase">Empty State Call to Action</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={showCta}
                  onChange={(e) => setShowCta(e.target.checked)}
                  className="rounded border-border accent-[#E50914]"
                />
                <span>Show CTA</span>
              </label>
            </div>

            {showCta && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-foreground/50 uppercase mb-0.5">CTA Button Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-3 py-1.5 bg-foreground/[0.03] border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-[#E50914]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-foreground/50 uppercase mb-0.5">CTA Link Destination</label>
                  <input
                    type="text"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-foreground/[0.03] border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-[#E50914]"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-border rounded-lg font-mono text-xs text-foreground/70 hover:bg-foreground/[0.05] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 sm:py-2 bg-[#E50914] hover:bg-[#b80710] text-white font-mono text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 min-h-[44px] sm:min-h-0"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

