"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getEvents,
  createEvent,
  updateEventStatus,
  deleteEvent,
  getRegistrationFields,
  upsertRegistrationFields,
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  logoutAdmin,
  type EventRow,
  type RegistrationFieldRow,
  type TeamMemberRow,
} from "@/app/actions/admin";
import {
  type SubmissionCategory,
  type CategorySettingsRow,
  SUBMISSION_CATEGORIES,
  DEFAULT_CATEGORY_SETTINGS,
  validateGoogleFormUrl,
} from "@/lib/submissions";
import {
  adminGetSubmissionPortalSettings,
  adminSetActiveCategory,
  adminUpdateCategorySettings,
} from "@/app/actions/submissions";
import { OFFICIAL_CLUB_SOCIALS } from "@/lib/socials";
import {
  Lock,
  LogOut,
  ExternalLink,
  Link2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Check,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type Tab = "events" | "team" | "submissions" | "links";
type FieldDraft = {
  field_name: string;
  prompt: string;
  field_type: "text" | "email" | "number" | "select";
  required: boolean;
  options: string[] | null;
  sort_order: number;
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("events");

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    await logoutAdmin();
    window.location.href = "/";
  };

  return (
    <div className="max-w-7xl mx-auto relative z-10">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--accent)]" />
            <span className="text-[10px] font-mono text-accent uppercase tracking-widest font-bold">
              secure_admin_session_active
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-mono">
            <span className="text-accent">ADMIN</span>_CONTROL_CENTER
          </h1>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground/[0.05] hover:bg-red-500/10 border border-border hover:border-red-500/30 text-xs font-mono text-foreground/60 hover:text-red-500 transition-all cursor-pointer w-fit"
          title="Lock Admin Console"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>LOCK CONSOLE</span>
        </button>
      </header>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-foreground/[0.04] border border-foreground/[0.06] w-fit mb-8">
        {(["events", "team", "submissions", "links"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`font-mono text-xs font-semibold px-5 py-2.5 rounded-md transition-all duration-200 cursor-pointer ${
              tab === t
                ? "bg-accent/[0.12] text-accent border border-accent/20"
                : "text-foreground/40 hover:text-foreground/70 border border-transparent"
            }`}
          >
            {t === "events"
              ? "⚡ Events"
              : t === "team"
              ? "👥 Team Members"
              : t === "submissions"
              ? "📝 Submissions Portal"
              : "🔗 Social Links"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "events" ? (
        <EventsPanel />
      ) : tab === "team" ? (
        <TeamPanel />
      ) : tab === "submissions" ? (
        <SubmissionsPanel />
      ) : (
        <LinksPanel />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EVENTS PANEL
// ═══════════════════════════════════════════════════════════════

function EventsPanel() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFieldsFor, setEditingFieldsFor] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const { data } = await getEvents();
    setEvents(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleStatusChange = async (eventId: string, newStatus: "open" | "soon" | "closed") => {
    const res = await updateEventStatus(eventId, newStatus);
    if (res.success) {
      setFeedback({ type: "success", text: "Status updated" });
      loadEvents();
    } else {
      setFeedback({ type: "error", text: res.error || "Failed" });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = async (eventId: string, title: string) => {
    if (!confirm(`Delete event "${title}"? This cannot be undone.`)) return;
    const res = await deleteEvent(eventId);
    if (res.success) {
      setFeedback({ type: "success", text: "Event deleted" });
      loadEvents();
    } else {
      setFeedback({ type: "error", text: res.error || "Failed" });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div>
      {/* Feedback toast */}
      {feedback && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg font-mono text-sm border backdrop-blur-md animate-pulse ${
            feedback.type === "success"
              ? "bg-accent/10 border-accent/30 text-accent"
              : "bg-red-400/10 border-red-400/30 text-red-400"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-mono text-lg text-foreground/60">
          Events <span className="text-foreground/20">({events.length})</span>
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2.5 bg-accent text-black font-mono text-xs font-bold rounded-lg hover:bg-green-300 transition-colors cursor-pointer"
        >
          + Add Event
        </button>
      </div>

      {/* Event creation modal */}
      {showForm && (
        <EventFormModal
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            setFeedback({ type: "success", text: "Event created!" });
            loadEvents();
            setTimeout(() => setFeedback(null), 3000);
          }}
        />
      )}

      {/* Registration fields editor modal */}
      {editingFieldsFor && (
        <FieldsEditorModal
          eventId={editingFieldsFor}
          eventTitle={events.find((e) => e.id === editingFieldsFor)?.title || ""}
          onClose={() => setEditingFieldsFor(null)}
          onSaved={() => {
            setEditingFieldsFor(null);
            setFeedback({ type: "success", text: "Registration fields saved!" });
            setTimeout(() => setFeedback(null), 3000);
          }}
        />
      )}

      {/* Events list */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-6 h-6 border-2 border-accent/30 border-t-green-400 rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 border border-foreground/[0.06] rounded-xl bg-foreground/[0.02]">
          <p className="text-foreground/20 font-mono text-sm">No events yet. Create your first one!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onEditFields={() => setEditingFieldsFor(event.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Event Card ────────────────────────────────────────────────

function EventCard({
  event,
  onStatusChange,
  onDelete,
  onEditFields,
}: {
  event: EventRow;
  onStatusChange: (id: string, status: "open" | "soon" | "closed") => void;
  onDelete: (id: string, title: string) => void;
  onEditFields: () => void;
}) {
  const statusColors: Record<string, string> = {
    open: "bg-accent/10 text-accent border-accent/20",
    soon: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    closed: "bg-red-400/10 text-red-400 border-red-400/20",
  };

  return (
    <div className="p-5 rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors">
      <div className="flex items-start gap-4">
        {/* Image thumbnail */}
        {event.image_url && (
          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-foreground/[0.06]">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-mono text-sm font-bold text-foreground truncate">{event.title}</h3>
            <span
              className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${statusColors[event.status]}`}
            >
              {event.status}
            </span>
          </div>
          <p className="text-xs text-foreground/30 font-mono mb-2 truncate">{event.subtitle}</p>
          <div className="flex flex-wrap gap-3 text-[10px] text-foreground/20 font-mono">
            <span>{event.date}</span>
            <span>{event.location}</span>
            <span>Team {event.team_min}–{event.team_max}</span>
            {event.chain && <span className="text-blue-400/50">{event.chain}</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Status toggle */}
          <select
            value={event.status}
            onChange={(e) => onStatusChange(event.id, e.target.value as "open" | "soon" | "closed")}
            className="bg-foreground/[0.05] border border-foreground/[0.1] text-foreground/60 text-xs font-mono rounded-md px-2 py-1.5 outline-none cursor-pointer hover:border-accent/30 transition-colors"
          >
            <option value="open" className="bg-[#0a0c0f]">Open</option>
            <option value="soon" className="bg-[#0a0c0f]">Coming Soon</option>
            <option value="closed" className="bg-[#0a0c0f]">Closed</option>
          </select>

          {/* Edit registration fields */}
          <button
            onClick={onEditFields}
            className="px-3 py-1.5 border border-foreground/[0.1] text-foreground/40 text-xs font-mono rounded-md hover:border-accent/30 hover:text-accent/60 transition-colors cursor-pointer"
            title="Edit registration fields"
          >
            📝 Fields
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(event.id, event.title)}
            className="px-3 py-1.5 border border-red-500/30 text-red-400 text-sm font-mono font-semibold rounded-md hover:bg-red-500/10 hover:border-red-400/60 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Event Form Modal ──────────────────────────────────────────

function EventFormModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await createEvent(formData);
    if (res.success) {
      onCreated();
    } else {
      setError(res.error || "Failed to create event");
    }
    setSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a0c0f] border border-green-500/20 rounded-xl shadow-[0_0_100px_rgba(34,197,94,0.15)]">
        {/* Title bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-green-500/10 bg-foreground/[0.02] sticky top-0 z-10 backdrop-blur-md">
          <h3 className="font-mono text-sm font-bold text-accent">+ CREATE_NEW_EVENT</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-foreground/[0.05] hover:bg-foreground/[0.1] flex items-center justify-center text-foreground/40 hover:text-foreground/80 transition-colors cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-mono">
              {error}
            </div>
          )}

          {/* Image upload */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-wider mb-2">
              Event Image
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-foreground/[0.1] hover:border-accent/30 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg object-cover" />
              ) : (
                <>
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📷</div>
                  <p className="text-xs text-foreground/30 font-mono">Click to upload event image</p>
                  <p className="text-[10px] text-foreground/15 font-mono mt-1">PNG, JPG, WebP — max 5MB</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                name="image"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Title + Subtitle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Title" name="title" placeholder="ETH Build Weekend" required />
            <FormField label="Subtitle" name="subtitle" placeholder="48-hour smart contract hackathon" />
          </div>

          {/* Date + Start Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Display Date" name="date" placeholder="May 24–26, 2026" required />
            <FormField label="Start Date (ISO)" name="start_date" type="datetime-local" required />
          </div>

          {/* Location + Prize */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Location" name="location" placeholder="Main Campus · Auditorium A" />
            <FormField label="Prize" name="prize" placeholder="₹2,00,000 Prize Pool" />
          </div>

          {/* Team size + Chain + Status */}
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Min Team" name="team_min" type="number" placeholder="1" />
            <FormField label="Max Team" name="team_max" type="number" placeholder="4" />
            <div>
              <label className="block text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-wider mb-2">
                Status
              </label>
              <select
                name="status"
                defaultValue="open"
                className="w-full bg-foreground/[0.05] border border-foreground/[0.1] text-foreground/70 text-sm font-mono rounded-lg px-3 py-2.5 outline-none focus:border-accent/40 transition-colors"
              >
                <option value="open" className="bg-[#0a0c0f]">Open</option>
                <option value="soon" className="bg-[#0a0c0f]">Coming Soon</option>
                <option value="closed" className="bg-[#0a0c0f]">Closed</option>
              </select>
            </div>
          </div>

          {/* Chain */}
          <FormField label="Chain (optional)" name="chain" placeholder="Ethereum, Solana, Polygon..." />

          {/* Tags + Sponsors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Tags (comma-separated)" name="tags" placeholder="Hackathon, DeFi, 24h" />
            <FormField label="Sponsors (comma-separated)" name="sponsors" placeholder="Alchemy, Base, Chainlink" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              required
              placeholder="Describe your event..."
              className="w-full bg-foreground/[0.05] border border-foreground/[0.1] text-foreground/70 text-sm font-mono rounded-lg px-3 py-2.5 outline-none focus:border-accent/40 transition-colors resize-none placeholder:text-foreground/15"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-foreground/[0.1] text-foreground/40 text-xs font-mono rounded-lg hover:text-foreground/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-accent text-black text-xs font-mono font-bold rounded-lg hover:bg-green-300 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Creating..." : "Create Event →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Registration Fields Editor Modal ──────────────────────────

function FieldsEditorModal({
  eventId,
  eventTitle,
  onClose,
  onSaved,
}: {
  eventId: string;
  eventTitle: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [fields, setFields] = useState<FieldDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await getRegistrationFields(eventId);
      if (data.length > 0) {
        setFields(
          data.map((f) => ({
            field_name: f.field_name,
            prompt: f.prompt,
            field_type: f.field_type,
            required: f.required,
            options: f.options,
            sort_order: f.sort_order,
          }))
        );
      } else {
        // Default fields
        setFields([
          { field_name: "name", prompt: "Enter your name", field_type: "text", required: true, options: null, sort_order: 0 },
          { field_name: "college", prompt: "Enter your college (or type none)", field_type: "text", required: true, options: null, sort_order: 1 },
          { field_name: "year", prompt: "Enter your graduation year (or type none)", field_type: "text", required: true, options: null, sort_order: 2 },
        ]);
      }
      setLoading(false);
    };
    load();
  }, [eventId]);

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        field_name: "",
        prompt: "",
        field_type: "text",
        required: true,
        options: null,
        sort_order: prev.length,
      },
    ]);
  };

  const removeField = (idx: number) => {
    setFields((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateField = (idx: number, key: keyof FieldDraft, value: any) => {
    setFields((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, [key]: value } : f))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await upsertRegistrationFields(eventId, fields);
    if (res.success) {
      onSaved();
    } else {
      alert(res.error || "Failed to save");
    }
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#0a0c0f] border border-green-500/20 rounded-xl shadow-[0_0_100px_rgba(34,197,94,0.15)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-green-500/10 bg-foreground/[0.02] sticky top-0 z-10 backdrop-blur-md">
          <div>
            <h3 className="font-mono text-sm font-bold text-accent">REGISTRATION_FIELDS</h3>
            <p className="text-[10px] text-foreground/30 font-mono mt-0.5">for: {eventTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-foreground/[0.05] hover:bg-foreground/[0.1] flex items-center justify-center text-foreground/40 hover:text-foreground/80 transition-colors cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block w-6 h-6 border-2 border-accent/30 border-t-green-400 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <p className="text-xs text-foreground/30 font-mono mb-4">
                These fields will be shown to users during registration in the terminal. Drag to reorder (or use the order they appear here).
              </p>

              <div className="flex flex-col gap-3 mb-4">
                {fields.map((field, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-foreground/[0.06] bg-foreground/[0.02] flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-accent/50 font-bold">
                        FIELD #{idx + 1}
                      </span>
                      <button
                        onClick={() => removeField(idx)}
                        className="text-[10px] font-mono text-red-400/50 hover:text-red-400 cursor-pointer transition-colors"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-mono text-foreground/30 uppercase mb-1">
                          Field Name (key)
                        </label>
                        <input
                          type="text"
                          value={field.field_name}
                          onChange={(e) => updateField(idx, "field_name", e.target.value)}
                          placeholder="college"
                          className="w-full bg-foreground/[0.05] border border-foreground/[0.1] text-foreground/70 text-xs font-mono rounded-md px-2.5 py-2 outline-none focus:border-accent/40 transition-colors placeholder:text-foreground/15"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-foreground/30 uppercase mb-1">
                          Type
                        </label>
                        <select
                          value={field.field_type}
                          onChange={(e) => updateField(idx, "field_type", e.target.value)}
                          className="w-full bg-foreground/[0.05] border border-foreground/[0.1] text-foreground/70 text-xs font-mono rounded-md px-2.5 py-2 outline-none focus:border-accent/40 transition-colors"
                        >
                          <option value="text" className="bg-[#0a0c0f]">Text</option>
                          <option value="email" className="bg-[#0a0c0f]">Email</option>
                          <option value="number" className="bg-[#0a0c0f]">Number</option>
                          <option value="select" className="bg-[#0a0c0f]">Select</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-foreground/30 uppercase mb-1">
                        Prompt (shown to user)
                      </label>
                      <input
                        type="text"
                        value={field.prompt}
                        onChange={(e) => updateField(idx, "prompt", e.target.value)}
                        placeholder="Enter your college (or type none)"
                        className="w-full bg-foreground/[0.05] border border-foreground/[0.1] text-foreground/70 text-xs font-mono rounded-md px-2.5 py-2 outline-none focus:border-accent/40 transition-colors placeholder:text-foreground/15"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(idx, "required", e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-foreground/20 bg-foreground/5 accent-green-400"
                        />
                        <span className="text-[10px] font-mono text-foreground/40">Required</span>
                      </label>
                    </div>

                    {field.field_type === "select" && (
                      <div>
                        <label className="block text-[9px] font-mono text-foreground/30 uppercase mb-1">
                          Options (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={(field.options || []).join(", ")}
                          onChange={(e) =>
                            updateField(
                              idx,
                              "options",
                              e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                            )
                          }
                          placeholder="Option 1, Option 2, Option 3"
                          className="w-full bg-foreground/[0.05] border border-foreground/[0.1] text-foreground/70 text-xs font-mono rounded-md px-2.5 py-2 outline-none focus:border-accent/40 transition-colors placeholder:text-foreground/15"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addField}
                className="w-full py-2.5 border border-dashed border-foreground/[0.1] hover:border-accent/30 text-foreground/30 hover:text-accent/60 text-xs font-mono rounded-lg transition-colors cursor-pointer mb-6"
              >
                + Add Field
              </button>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 border border-foreground/[0.1] text-foreground/40 text-xs font-mono rounded-lg hover:text-foreground/60 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-accent text-black text-xs font-mono font-bold rounded-lg hover:bg-green-300 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Fields →"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TEAM PANEL
// ═══════════════════════════════════════════════════════════════

function TeamPanel() {
  const [members, setMembers] = useState<TeamMemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberRow | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    const data = await getTeamMembers();
    setMembers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" from the team?`)) return;
    const res = await deleteTeamMember(id);
    if (res.success) {
      setFeedback({ type: "success", text: "Member removed" });
      loadMembers();
    } else {
      setFeedback({ type: "error", text: res.error || "Failed" });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div>
      {/* Feedback toast */}
      {feedback && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg font-mono text-sm border backdrop-blur-md ${
            feedback.type === "success"
              ? "bg-accent/10 border-accent/30 text-accent"
              : "bg-red-400/10 border-red-400/30 text-red-400"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-mono text-lg text-foreground/60">
          Team Members <span className="text-foreground/20">({members.length})</span>
        </h2>
        <button
          onClick={() => {
            setEditingMember(null);
            setShowForm(true);
          }}
          className="px-5 py-2.5 bg-accent text-black font-mono text-xs font-bold rounded-lg hover:bg-green-300 transition-colors cursor-pointer"
        >
          + Add Member
        </button>
      </div>

      {/* Team member form modal */}
      {showForm && (
        <TeamMemberFormModal
          initialData={editingMember}
          onClose={() => {
            setShowForm(false);
            setEditingMember(null);
          }}
          onCreated={() => {
            setShowForm(false);
            setEditingMember(null);
            setFeedback({ type: "success", text: editingMember ? "Member updated!" : "Member added!" });
            loadMembers();
            setTimeout(() => setFeedback(null), 3000);
          }}
        />
      )}

      {/* Members grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-6 h-6 border-2 border-accent/30 border-t-green-400 rounded-full animate-spin" />
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-20 border border-foreground/[0.06] rounded-xl bg-foreground/[0.02]">
          <p className="text-foreground/20 font-mono text-sm">No team members yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="p-5 rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden border border-foreground/[0.1] shrink-0 bg-foreground/[0.05]">
                  {member.image_url ? (
                    <img
                      src={member.image_url}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground/20 text-lg font-bold">
                      {member.name[0]}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-mono text-sm font-bold text-foreground truncate">{member.name}</h3>
                  <p className="text-[10px] text-accent/60 font-mono uppercase tracking-wider">{member.role}</p>
                  <p className="text-[10px] text-cyan-400/50 font-mono uppercase tracking-wider mt-0.5">{member.department}</p>
                  {member.description && (
                    <p className="text-xs text-foreground/30 mt-1 line-clamp-2">{member.description}</p>
                  )}

                  {/* Social icons */}
                  <div className="flex gap-2 mt-2">
                    {Object.entries(member.socials || {}).map(([platform, url]) =>
                      url && url !== "#" ? (
                        <span key={platform} className="text-[9px] font-mono text-foreground/20">
                          {platform}
                        </span>
                      ) : null
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      setEditingMember(member);
                      setShowForm(true);
                    }}
                    className="text-lg text-foreground/30 hover:text-accent transition-colors cursor-pointer"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(member.id, member.name)}
                    className="text-lg text-foreground/30 hover:text-red-400 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Team Member Form Modal ────────────────────────────────────

function TeamMemberFormModal({
  initialData,
  onClose,
  onCreated,
}: {
  initialData?: TeamMemberRow | null;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = initialData
      ? await updateTeamMember(initialData.id, formData)
      : await createTeamMember(formData);

    if (res.success) {
      onCreated();
    } else {
      setError(res.error || `Failed to ${initialData ? 'update' : 'add'} member`);
    }
    setSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-[#0a0c0f] border border-green-500/20 rounded-xl shadow-[0_0_100px_rgba(34,197,94,0.15)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-green-500/10 bg-foreground/[0.02] sticky top-0 z-10 backdrop-blur-md">
          <h3 className="font-mono text-sm font-bold text-accent">{initialData ? "✏️ EDIT_TEAM_MEMBER" : "+ ADD_TEAM_MEMBER"}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-foreground/[0.05] hover:bg-foreground/[0.1] flex items-center justify-center text-foreground/40 hover:text-foreground/80 transition-colors cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-mono">
              {error}
            </div>
          )}

          {/* Image */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-wider mb-2">
              Photo
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-foreground/[0.1] hover:border-accent/30 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <>
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">👤</div>
                  <p className="text-xs text-foreground/30 font-mono">Upload photo</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                name="image"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Name + Role */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Name" name="name" defaultValue={initialData?.name} placeholder="Vitalik Buterin" required />
            <FormField label="Role" name="role" defaultValue={initialData?.role} placeholder="Protocol Lead" required />
          </div>

          {/* Department & Hierarchy */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-wider mb-2">
                Department
              </label>
              <select
                name="department"
                required
                defaultValue={initialData?.department || ""}
                className="w-full bg-foreground/[0.05] border border-foreground/[0.1] text-foreground/70 text-sm font-mono rounded-lg px-3 py-2.5 outline-none focus:border-accent/40 transition-colors"
              >
                <option value="" disabled className="bg-[#0a0c0f]">Select department...</option>
                <option value="core" className="bg-[#0a0c0f]">Core</option>
                <option value="media & design" className="bg-[#0a0c0f]">Media &amp; Design</option>
                <option value="tech" className="bg-[#0a0c0f]">Tech</option>
                <option value="marketing" className="bg-[#0a0c0f]">Marketing</option>
                <option value="event&ops" className="bg-[#0a0c0f]">Event &amp; Ops</option>
                <option value="corporate relations" className="bg-[#0a0c0f]">Corporate Relations</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-wider mb-2">
                Hierarchy Level
              </label>
              <select
                name="hierarchy_level"
                defaultValue={initialData?.hierarchy_level || ""}
                className="w-full bg-foreground/[0.05] border border-foreground/[0.1] text-foreground/70 text-sm font-mono rounded-lg px-3 py-2.5 outline-none focus:border-accent/40 transition-colors"
              >
                <option value="" className="bg-[#0a0c0f]">Associate (Default)</option>
                <option value="president" className="bg-[#0a0c0f]">President / Vice President</option>
                <option value="lead" className="bg-[#0a0c0f]">Lead</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <FormField label="Description" name="description" defaultValue={initialData?.description || ""} placeholder="Short bio..." />

          {/* Socials */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-wider mb-2">
              Social Links
            </label>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="" name="twitter" defaultValue={initialData?.socials?.twitter || ""} placeholder="Twitter URL" />
              <FormField label="" name="linkedin" defaultValue={initialData?.socials?.linkedin || ""} placeholder="LinkedIn URL" />
              <FormField label="" name="github" defaultValue={initialData?.socials?.github || ""} placeholder="GitHub URL" />
              <FormField label="" name="instagram" defaultValue={initialData?.socials?.instagram || ""} placeholder="Instagram URL" />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-foreground/[0.1] text-foreground/40 text-xs font-mono rounded-lg hover:text-foreground/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-accent text-black text-xs font-mono font-bold rounded-lg hover:bg-green-300 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (initialData ? "Updating..." : "Adding...") : (initialData ? "Update Member →" : "Add Member →")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Shared Form Field component
// ═══════════════════════════════════════════════════════════════

function FormField({
  label,
  name,
  placeholder,
  required,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      {label && (
        <label className="block text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        className="w-full bg-foreground/[0.05] border border-foreground/[0.1] text-foreground/70 text-sm font-mono rounded-lg px-3 py-2.5 outline-none focus:border-accent/40 transition-colors placeholder:text-foreground/15"
      />
    </div>
  );
}



// ═══════════════════════════════════════════════════════════════
// SUBMISSIONS PORTAL PANEL
// ═══════════════════════════════════════════════════════════════

function SubmissionsPanel() {
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<SubmissionCategory>("project_proposal");
  const [selectedCatTab, setSelectedCatTab] = useState<SubmissionCategory>("project_proposal");
  const [categories, setCategories] = useState<Record<SubmissionCategory, CategorySettingsRow>>({
    project_proposal: { ...DEFAULT_CATEGORY_SETTINGS.project_proposal },
    join_project: { ...DEFAULT_CATEGORY_SETTINGS.join_project },
    events: { ...DEFAULT_CATEGORY_SETTINGS.events },
    hackathons: { ...DEFAULT_CATEGORY_SETTINGS.hackathons },
  });
  const [formDraft, setFormDraft] = useState<CategorySettingsRow>({
    ...DEFAULT_CATEGORY_SETTINGS.project_proposal,
  });
  const [urlError, setUrlError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [switchingActive, setSwitchingActive] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const res = await adminGetSubmissionPortalSettings();
    if (res.success) {
      setActiveCategory(res.active_category);
      setCategories(res.categories);
      setFormDraft({ ...res.categories[selectedCatTab] });
    } else {
      setFeedback({ type: "error", text: res.error || "Failed to load submission portal settings" });
    }
    setLoading(false);
  }, [selectedCatTab]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSelectTab = (cat: SubmissionCategory) => {
    setSelectedCatTab(cat);
    setFormDraft({ ...categories[cat] });
    setUrlError(null);
    setFeedback(null);
  };

  const handleUrlChange = (val: string) => {
    setFormDraft((prev) => ({ ...prev, google_form_url: val }));
    if (!val.trim()) {
      setUrlError(null);
      return;
    }
    const check = validateGoogleFormUrl(val);
    setUrlError(check.valid ? null : check.error || "Invalid Google Form URL");
  };

  const handleFieldChange = (
    field: keyof CategorySettingsRow,
    val: string | boolean
  ) => {
    setFormDraft((prev) => ({ ...prev, [field]: val }));
  };

  const handleSetActiveCategory = async (cat: SubmissionCategory) => {
    setSwitchingActive(true);
    const res = await adminSetActiveCategory(cat);
    if (res.success) {
      setActiveCategory(cat);
      setFeedback({
        type: "success",
        text: `Active track switched to "${SUBMISSION_CATEGORIES.find((c) => c.id === cat)?.name}". Visitors on /join will now see this track.`,
      });
    } else {
      setFeedback({ type: "error", text: res.error || "Failed to switch active track" });
    }
    setSwitchingActive(false);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (urlError) return;

    setSaving(true);
    const res = await adminUpdateCategorySettings(selectedCatTab, formDraft);
    if (res.success) {
      setCategories((prev) => ({
        ...prev,
        [selectedCatTab]: { ...formDraft },
      }));
      setFeedback({
        type: "success",
        text: `Configuration for "${SUBMISSION_CATEGORIES.find((c) => c.id === selectedCatTab)?.name}" published successfully!`,
      });
    } else {
      setFeedback({ type: "error", text: res.error || "Failed to save category configuration" });
    }
    setSaving(false);
  };

  const handleClearUrl = async () => {
    if (!confirm("Clear Google Form URL? The /join portal will switch to the 'Coming Soon' state displaying official social channels.")) {
      return;
    }
    setSaving(true);
    const updated = { ...formDraft, google_form_url: null };
    const res = await adminUpdateCategorySettings(selectedCatTab, { google_form_url: null });
    if (res.success) {
      setFormDraft(updated);
      setCategories((prev) => ({
        ...prev,
        [selectedCatTab]: updated,
      }));
      setUrlError(null);
      setFeedback({
        type: "success",
        text: `Google Form URL cleared. "${SUBMISSION_CATEGORIES.find((c) => c.id === selectedCatTab)?.name}" will now show Coming Soon.`,
      });
    } else {
      setFeedback({ type: "error", text: res.error || "Failed to clear URL" });
    }
    setSaving(false);
  };

  const handleTestUrl = () => {
    if (formDraft.google_form_url) {
      window.open(formDraft.google_form_url, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-sm text-foreground/40 animate-pulse">
        LOADING_SUBMISSION_PORTAL_SETTINGS...
      </div>
    );
  }

  const activeMeta = SUBMISSION_CATEGORIES.find((c) => c.id === activeCategory);
  const selectedMeta = SUBMISSION_CATEGORIES.find((c) => c.id === selectedCatTab);
  const isFormLive = Boolean(formDraft.google_form_url && formDraft.google_form_url.trim().length > 0);
  const isComingSoon = formDraft.is_open && !isFormLive;

  return (
    <div className="space-y-8">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border font-mono text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-accent/10 border-accent/30 text-accent"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-foreground/40 hover:text-foreground text-xs ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── SECTION 1: GLOBAL ACTIVE TRACK SELECTOR ── */}
      <div className="p-6 rounded-2xl bg-card border border-border space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-foreground">
                LIVE ACTIVE SUBMISSION TRACK
              </h2>
            </div>
            <p className="font-mono text-xs text-foreground/60">
              Select which track is currently active on the public{" "}
              <a href="/join" target="_blank" className="text-accent underline hover:text-accent/80">
                /join
              </a>{" "}
              portal. Only one track is active at a time.
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold shrink-0 self-start sm:self-center">
            CURRENT: {activeMeta?.name.toUpperCase()}
          </div>
        </div>

        {/* 4 Track Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SUBMISSION_CATEGORIES.map((cat) => {
            const isCurrentlyActive = activeCategory === cat.id;
            return (
              <div
                key={cat.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  isCurrentlyActive
                    ? "bg-accent/[0.08] border-accent/40 shadow-sm"
                    : "bg-foreground/[0.02] border-border hover:border-foreground/30"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-foreground uppercase">
                      {cat.name}
                    </span>
                    {isCurrentlyActive && (
                      <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    )}
                  </div>
                  <p className="font-mono text-[10.5px] text-foreground/60 leading-relaxed">
                    {cat.tagline}
                  </p>
                </div>

                {isCurrentlyActive ? (
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-accent">
                    <Check className="w-3.5 h-3.5" />
                    <span>ACTIVE ON /JOIN</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={switchingActive}
                    onClick={() => handleSetActiveCategory(cat.id)}
                    className="w-full py-2 px-3 rounded-lg bg-foreground/[0.05] hover:bg-accent/20 border border-border hover:border-accent/40 font-mono text-xs text-foreground/80 hover:text-accent font-semibold transition-all cursor-pointer text-center"
                  >
                    Set as Active
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 2: PER-CATEGORY CONFIGURATION EDITOR ── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-mono font-bold uppercase tracking-wider text-foreground">
              TRACK CONFIGURATION EDITOR
            </h2>
            <p className="font-mono text-xs text-foreground/50">
              Configure Google Form links, open/closed status, and copy for each track independently.
            </p>
          </div>

          {/* Sub-Tabs for the 4 Tracks */}
          <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-foreground/[0.04] border border-border">
            {SUBMISSION_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectTab(cat.id)}
                className={`font-mono text-xs font-semibold px-3.5 py-2 rounded-md transition-all cursor-pointer ${
                  selectedCatTab === cat.id
                    ? "bg-accent/[0.14] text-accent border border-accent/25 shadow-sm"
                    : "text-foreground/45 hover:text-foreground/80 border border-transparent"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Form */}
        <form onSubmit={handleSaveCategory} className="space-y-6">
          {/* Status & Form Link Card */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      !formDraft.is_open
                        ? "bg-red-500"
                        : isComingSoon
                        ? "bg-amber-400 animate-pulse"
                        : "bg-emerald-500 animate-pulse"
                    }`}
                  />
                  <h3 className="font-mono font-bold text-sm uppercase text-foreground">
                    {selectedMeta?.name} Status & Link
                  </h3>
                </div>
                <p className="font-mono text-xs text-foreground/50 mt-0.5">
                  Current portal state:{" "}
                  <strong className="text-foreground">
                    {!formDraft.is_open
                      ? "CLOSED"
                      : isComingSoon
                      ? "COMING SOON (No Form URL)"
                      : "OPEN (Google Form Linked)"}
                  </strong>
                </p>
              </div>

              {/* Toggle Open/Closed */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-foreground/60">
                  {formDraft.is_open ? "Submissions Open" : "Submissions Closed"}
                </span>
                <button
                  type="button"
                  onClick={() => handleFieldChange("is_open", !formDraft.is_open)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    formDraft.is_open ? "bg-accent" : "bg-foreground/20"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formDraft.is_open ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Google Form URL Input */}
            <div className="space-y-3">
              <label className="block text-[10px] font-mono font-bold text-foreground/60 uppercase tracking-wider">
                Google Form URL (forms.gle or docs.google.com/forms/...)
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="url"
                  value={formDraft.google_form_url || ""}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://forms.gle/xyz123... or https://docs.google.com/forms/d/e/.../viewform"
                  className={`flex-1 bg-foreground/[0.04] border ${
                    urlError ? "border-red-500" : "border-foreground/[0.1] focus:border-accent/40"
                  } text-foreground text-sm font-mono rounded-lg p-3 outline-none transition-colors`}
                />
                <button
                  type="button"
                  disabled={!formDraft.google_form_url || Boolean(urlError)}
                  onClick={handleTestUrl}
                  className="px-4 py-3 rounded-lg bg-foreground/[0.05] hover:bg-foreground/[0.1] border border-border text-foreground font-mono text-xs font-bold uppercase transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5"
                >
                  <span>Test Form</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                {formDraft.google_form_url && (
                  <button
                    type="button"
                    onClick={handleClearUrl}
                    className="px-4 py-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-xs font-bold uppercase transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Clear URL
                  </button>
                )}
              </div>
              {urlError ? (
                <p className="text-xs font-mono text-red-400">{urlError}</p>
              ) : (
                <p className="text-[11px] font-mono text-foreground/45">
                  Leaving this field blank activates the &ldquo;Coming Soon&rdquo; state on the public portal with community social channel links.
                </p>
              )}
            </div>
          </div>

          {/* Copy Customization Section */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
            <div className="border-b border-border pb-3">
              <h3 className="font-mono font-bold text-sm uppercase text-foreground">
                Portal Copy & Headings (/join)
              </h3>
              <p className="font-mono text-xs text-foreground/50">
                Custom text displayed to student builders when this category is active.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-1.5">
                  Page Heading (join_heading)
                </label>
                <input
                  type="text"
                  value={formDraft.join_heading}
                  onChange={(e) => handleFieldChange("join_heading", e.target.value)}
                  required
                  maxLength={200}
                  className="w-full bg-foreground/[0.04] border border-foreground/[0.1] text-foreground text-sm font-mono rounded-lg p-3 outline-none focus:border-accent/40"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-1.5">
                  CTA Button Label (cta_label)
                </label>
                <input
                  type="text"
                  value={formDraft.cta_label}
                  onChange={(e) => handleFieldChange("cta_label", e.target.value)}
                  required
                  maxLength={100}
                  className="w-full bg-foreground/[0.04] border border-foreground/[0.1] text-foreground text-sm font-mono rounded-lg p-3 outline-none focus:border-accent/40"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-1.5">
                  Page Subtitle / Mission (join_subtitle)
                </label>
                <textarea
                  value={formDraft.join_subtitle}
                  onChange={(e) => handleFieldChange("join_subtitle", e.target.value)}
                  required
                  rows={2}
                  maxLength={1000}
                  className="w-full bg-foreground/[0.04] border border-foreground/[0.1] text-foreground text-sm font-mono rounded-lg p-3 outline-none focus:border-accent/40"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-1.5">
                  Closed Cycle Notice (closing_text)
                </label>
                <textarea
                  value={formDraft.closing_text}
                  onChange={(e) => handleFieldChange("closing_text", e.target.value)}
                  required
                  rows={2}
                  maxLength={1000}
                  className="w-full bg-foreground/[0.04] border border-foreground/[0.1] text-foreground text-sm font-mono rounded-lg p-3 outline-none focus:border-accent/40"
                />
              </div>
            </div>

            {/* Checklist items */}
            <div className="pt-4 border-t border-border space-y-3">
              <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase">
                Checklist Badges (4 Slots)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((num) => {
                  const key = `checklist_label_${num}` as keyof CategorySettingsRow;
                  return (
                    <input
                      key={num}
                      type="text"
                      value={(formDraft[key] as string) || ""}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      placeholder={`Badge #${num}`}
                      required
                      maxLength={60}
                      className="bg-foreground/[0.04] border border-foreground/[0.1] text-foreground text-xs font-mono rounded-lg p-2.5 outline-none focus:border-accent/40"
                    />
                  );
                })}
              </div>
            </div>

            {/* Feature Cards */}
            <div className="pt-4 border-t border-border space-y-4">
              <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase">
                Feature Highlight Cards (2 Slots)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border/70 bg-foreground/[0.015] space-y-3">
                  <span className="font-mono text-xs font-bold text-accent uppercase">Card 01</span>
                  <input
                    type="text"
                    value={formDraft.card1_heading}
                    onChange={(e) => handleFieldChange("card1_heading", e.target.value)}
                    placeholder="Card 1 Heading"
                    required
                    maxLength={200}
                    className="w-full bg-foreground/[0.04] border border-foreground/[0.1] text-foreground text-xs font-mono rounded-lg p-2.5 outline-none"
                  />
                  <textarea
                    value={formDraft.card1_desc}
                    onChange={(e) => handleFieldChange("card1_desc", e.target.value)}
                    placeholder="Card 1 Description"
                    required
                    rows={2}
                    maxLength={500}
                    className="w-full bg-foreground/[0.04] border border-foreground/[0.1] text-foreground text-xs font-mono rounded-lg p-2.5 outline-none"
                  />
                </div>

                <div className="p-4 rounded-xl border border-border/70 bg-foreground/[0.015] space-y-3">
                  <span className="font-mono text-xs font-bold text-accent uppercase">Card 02</span>
                  <input
                    type="text"
                    value={formDraft.card2_heading}
                    onChange={(e) => handleFieldChange("card2_heading", e.target.value)}
                    placeholder="Card 2 Heading"
                    required
                    maxLength={200}
                    className="w-full bg-foreground/[0.04] border border-foreground/[0.1] text-foreground text-xs font-mono rounded-lg p-2.5 outline-none"
                  />
                  <textarea
                    value={formDraft.card2_desc}
                    onChange={(e) => handleFieldChange("card2_desc", e.target.value)}
                    placeholder="Card 2 Description"
                    required
                    rows={2}
                    maxLength={500}
                    className="w-full bg-foreground/[0.04] border border-foreground/[0.1] text-foreground text-xs font-mono rounded-lg p-2.5 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || Boolean(urlError)}
              className="px-8 py-3.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_var(--accent-glow)] cursor-pointer disabled:opacity-50"
            >
              {saving ? "SAVING CONFIGURATION..." : `SAVE SETTINGS FOR ${selectedMeta?.name.toUpperCase()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SOCIAL LINKS PANEL
// ═══════════════════════════════════════════════════════════════

function LinksPanel() {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-accent" />
          <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-foreground">
            Official WEB.3 Community Channels
          </h2>
        </div>
        <p className="font-mono text-xs text-foreground/60 leading-relaxed max-w-2xl">
          Verified community links centralized across the CyberSidebar and the /join Coming Soon state. Sourced from <code className="text-foreground">src/lib/socials.ts</code>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {OFFICIAL_CLUB_SOCIALS.map((soc) => (
            <div
              key={soc.id}
              className="p-4 rounded-xl border border-border/80 bg-foreground/[0.02] flex items-center justify-between font-mono text-xs"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-foreground block">{soc.name}</span>
                <span className="text-[11px] text-foreground/50 truncate max-w-[280px] block">
                  {soc.href}
                </span>
              </div>
              <a
                href={soc.href}
                target={soc.href.startsWith("http") ? "_blank" : undefined}
                rel={soc.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="p-2 rounded-lg bg-foreground/[0.05] hover:bg-accent/20 text-foreground/70 hover:text-accent transition-colors"
                title={`Visit ${soc.name}`}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
