"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getEvents,
  createEvent,
  updateEventStatus,
  updateEvent,
  updateEventMeta,
  deleteEvent,
  getRegistrationFields,
  upsertRegistrationFields,
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  uploadEventMedia,
  getEventMedia,
  deleteEventMedia,
  getStorageUsage,
  type EventRow,
  type RegistrationFieldRow,
  type TeamMemberRow,
  type EventMediaRow,
} from "@/app/actions/admin";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type Tab = "events" | "team";
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

  return (
    <div className="max-w-7xl mx-auto relative z-10">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-mono text-accent uppercase tracking-widest">
            secure_admin_session_active
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-mono">
          <span className="text-accent">ADMIN</span>_CONTROL_CENTER
        </h1>
      </header>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-lg bg-foreground/[0.04] border border-foreground/[0.06] w-fit mb-8">
        {(["events", "team"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`font-mono text-xs font-semibold px-5 py-2.5 rounded-md transition-all duration-200 cursor-pointer ${
              tab === t
                ? "bg-accent/[0.12] text-accent border border-accent/20"
                : "text-foreground/30 hover:text-foreground/50 border border-transparent"
            }`}
          >
            {t === "events" ? "⚡ Events" : "👥 Team"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "events" ? <EventsPanel /> : <TeamPanel />}
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
  const [showMediaUpload, setShowMediaUpload] = useState(false);
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

  const handleMediaUploaded = () => {
    setShowMediaUpload(false);
    setFeedback({ type: "success", text: "Media uploaded successfully!" });
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMediaUpload(true)}
            className="px-5 py-2.5 bg-blue-600 text-white font-mono text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            📸 Upload Media
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-accent text-black font-mono text-xs font-bold rounded-lg hover:bg-green-300 transition-colors cursor-pointer"
          >
            + Add Event
          </button>
        </div>
      </div>

      {/* Media upload modal */}
      {showMediaUpload && (
        <MediaUploadModal
          events={events}
          onClose={() => setShowMediaUpload(false)}
          onUploaded={handleMediaUploaded}
        />
      )}

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
              onUploadMedia={() => setShowMediaUpload(true)}
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
  onUploadMedia,
}: {
  event: EventRow;
  onStatusChange: (id: string, status: "open" | "soon" | "closed") => void;
  onDelete: (id: string, title: string) => void;
  onEditFields: () => void;
  onUploadMedia: () => void;
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
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
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

          {/* Upload media button */}
          <button
            onClick={onUploadMedia}
            className="px-3 py-1.5 border border-blue-500/30 text-blue-400 text-xs font-mono rounded-md hover:bg-blue-500/10 hover:border-blue-400/60 transition-colors cursor-pointer"
            title="Upload event media"
          >
            📸 Media
          </button>

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

// ── Media Upload Modal ────────────────────────────────────────

function MediaUploadModal({
  events,
  onClose,
  onUploaded,
}: {
  events: EventRow[];
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || "");
  const [eventTitle, setEventTitle] = useState<string>(events[0]?.title || "");
  const [eventDescription, setEventDescription] = useState<string>(events[0]?.description || "");
  const [mediaTitles, setMediaTitles] = useState<Record<string, string>>({});
  const [mediaDescriptions, setMediaDescriptions] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState<{ used: number; limit: number; remaining: number; percentage: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const selectedEvent = events.find((event) => event.id === selectedEventId) || events[0];
    if (selectedEvent) {
      setEventTitle(selectedEvent.title);
      setEventDescription(selectedEvent.description || "");
    }
  }, [selectedEventId, events]);

  useEffect(() => {
    const loadStorageInfo = async () => {
      try {
        const info = await getStorageUsage();
        setStorageInfo(info);
      } catch (err: any) {
        setError(`Storage status failed: ${err?.message ?? "Unknown error"}`);
      }
    };
    loadStorageInfo();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    const fileName = selectedFiles[index].name;
    setMediaTitles((prev) => {
      const newTitles = { ...prev };
      delete newTitles[fileName];
      return newTitles;
    });
    setMediaDescriptions((prev) => {
      const newDescs = { ...prev };
      delete newDescs[fileName];
      return newDescs;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || selectedFiles.length === 0) {
      setError("Please select an event and at least one file.");
      return;
    }

    setUploading(true);
    setError(null);

    const selectedEvent = events.find((event) => event.id === selectedEventId);
    if (selectedEvent && (eventTitle !== selectedEvent.title || eventDescription !== (selectedEvent.description || ""))) {
      const metaUpdate = await updateEventMeta(selectedEventId, eventTitle, eventDescription);
      if (!metaUpdate.success) {
        setUploading(false);
        setError(metaUpdate.error || "Failed to update event metadata.");
        return;
      }
    }

    let successCount = 0;
    let failureCount = 0;
    let firstFailureMessage: string | null = null;

    for (let i = 0; i < selectedFiles.length; i++) {
      setUploadingIndex(i);
      const file = selectedFiles[i];
      const res = await uploadEventMedia(
        selectedEventId,
        mediaTitles[file.name] || "",
        mediaDescriptions[file.name] || "",
        file
      );

      if (res.success) {
        successCount++;
      } else {
        failureCount++;
        if (!firstFailureMessage) {
          firstFailureMessage = `Upload failed for ${file.name}: ${res.error || "Unknown error"}`;
        }
      }
    }

    setUploading(false);
    setUploadingIndex(null);

    if (failureCount === 0) {
      setError(null);
      onUploaded();
    } else {
      setError(`${firstFailureMessage}. Uploaded ${successCount}, failed ${failureCount}.`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a0c0f] border border-blue-500/20 rounded-xl shadow-[0_0_100px_rgba(59,130,246,0.15)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-500/10 bg-blue-500/5 sticky top-0 z-10 backdrop-blur-md">
          <h3 className="font-mono text-base font-bold text-blue-300">📸 UPLOAD_EVENT_MEDIA</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-foreground/[0.08] hover:bg-foreground/[0.15] flex items-center justify-center text-blue-200 hover:text-white transition-colors cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-400/10 border border-red-400/30 text-red-300 text-xs font-mono">
              {error}
            </div>
          )}

          {/* Storage info */}
          {storageInfo && (
            <div className="px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-400/30 text-blue-200 text-[11px] font-mono space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Storage Status</span>
                <span className="text-blue-300 font-bold text-sm">{storageInfo.percentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-blue-500/10 rounded-full overflow-hidden border border-blue-400/20">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all"
                  style={{ width: `${storageInfo.percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Used: {(storageInfo.used / 1024 / 1024).toFixed(2)} MB</span>
                <span>Limit: {(storageInfo.limit / 1024 / 1024 / 1024).toFixed(1)} GB</span>
                <span className="text-blue-300 font-semibold">Free: {(storageInfo.remaining / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
          )}

          {/* Event selector */}
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-bold text-blue-300 uppercase tracking-wider mb-2.5">
                Select Event *
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-foreground/[0.08] border border-blue-400/20 text-foreground/80 text-sm font-mono rounded-lg px-3 py-3 outline-none focus:border-blue-400/50 focus:bg-foreground/[0.1] transition-colors"
              >
                <option value="">-- Choose an event --</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id} className="bg-[#0a0c0f]">
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-blue-300 uppercase tracking-wider mb-2.5">
                Event Title
              </label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full bg-foreground/[0.08] border border-blue-400/20 text-foreground/90 text-sm font-mono rounded-lg px-3 py-3 outline-none focus:border-blue-400/50 focus:bg-foreground/[0.1] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-blue-300 uppercase tracking-wider mb-2.5">
                Event Description
              </label>
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                rows={3}
                className="w-full bg-foreground/[0.08] border border-blue-400/20 text-foreground/90 text-sm font-mono rounded-lg px-3 py-3 outline-none focus:border-blue-400/50 focus:bg-foreground/[0.1] transition-colors resize-none"
              />
            </div>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-blue-300 uppercase tracking-wider mb-2.5">
              Choose Files (Multiple) *
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-blue-400/30 hover:border-blue-400/60 bg-blue-500/5 hover:bg-blue-500/10 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📸</div>
              <p className="text-sm text-blue-200 font-mono font-semibold">Click to upload or drag & drop</p>
              <p className="text-[11px] text-blue-300/60 font-mono mt-2">Images, videos — max 500MB each</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {/* Selected files list */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-mono font-bold text-blue-300 uppercase tracking-wider">
                  Selected Files ({selectedFiles.length})
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFiles([]);
                    setMediaTitles({});
                    setMediaDescriptions({});
                  }}
                  className="text-[10px] text-red-400/70 hover:text-red-300 font-mono cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3 bg-foreground/[0.03] p-4 rounded-lg border border-foreground/[0.06]">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="bg-foreground/[0.05] border border-blue-400/15 rounded-lg p-4 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                          <p className="text-[10px] text-foreground/50 font-mono truncate">{file.name}</p>
                        </div>
                        <p className="text-[10px] text-foreground/30 font-mono">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-400/50 hover:text-red-300 text-lg transition-colors"
                        title="Remove"
                      >
                        🗑
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-blue-200 uppercase mb-1.5">
                        Title (optional)
                      </label>
                      <input
                        type="text"
                        value={mediaTitles[file.name] || ""}
                        onChange={(e) =>
                          setMediaTitles((prev) => ({ ...prev, [file.name]: e.target.value }))
                        }
                        placeholder="e.g., Opening Ceremony"
                        className="w-full bg-foreground/[0.08] border border-blue-400/20 text-foreground/90 text-xs font-mono rounded-lg px-2.5 py-2 outline-none focus:border-blue-400/50 focus:bg-foreground/[0.12] transition-colors placeholder:text-foreground/40"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-blue-200 uppercase mb-1.5">
                        Description (optional)
                      </label>
                      <textarea
                        value={mediaDescriptions[file.name] || ""}
                        onChange={(e) =>
                          setMediaDescriptions((prev) => ({ ...prev, [file.name]: e.target.value }))
                        }
                        placeholder="Add details..."
                        rows={2}
                        className="w-full bg-foreground/[0.05] border border-foreground/[0.1] text-foreground/80 text-xs font-mono rounded-lg px-2.5 py-2 outline-none focus:border-blue-400/40 transition-colors resize-none placeholder:text-foreground/20"
                      />
                    </div>

                    {uploadingIndex === index && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                        <span className="text-[10px] text-blue-300 font-mono">Uploading...</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 justify-end pt-4 border-t border-foreground/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-blue-400/20 text-blue-200 text-xs font-mono font-semibold rounded-lg hover:text-white hover:border-blue-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedEventId || selectedFiles.length === 0}
              className="px-6 py-2.5 bg-blue-600 text-white text-xs font-mono font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {uploading ? `Uploading (${uploadingIndex !== null ? uploadingIndex + 1 : 0}/${selectedFiles.length})...` : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? "s" : ""} →`}
            </button>
          </div>
        </form>
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
