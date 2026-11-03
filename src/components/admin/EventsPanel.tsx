"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Archive,
  RotateCcw,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  Check,
  X,
  Layers,
  ChevronDown,
  Upload,
} from "lucide-react";
import {
  adminGetAllEvents,
  adminCreateEvent,
  adminUpdateEvent,
  adminDeleteEvent,
  adminToggleEventPublish,
  adminToggleEventArchive,
  adminSaveEventSchedule,
  adminUploadGalleryImage,
  adminDeleteGalleryImage,
  adminSaveEventContent,
  getPublicEventBySlug,
} from "@/app/actions/events";
import {
  type EventRow,
  type EventDetail,
  type EventDayRow,
  type EventSessionRow,
  type EventGalleryRow,
  type LearningCard,
  type EventRegistrationStatus,
  type EventPublicationStatus,
  type EventClassification,
  EVENT_CATEGORIES,
  DEFAULT_DECRYPTO_DAYS,
  DEFAULT_DECRYPTO_LEARN_CARDS,
  slugifyEventTitle,
} from "@/lib/events";

export default function EventsPanel() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "upcoming" | "archived" | "published" | "draft"
  >("all");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modals state
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);
  const [scheduleEvent, setScheduleEvent] = useState<EventRow | null>(null);
  const [galleryEvent, setGalleryEvent] = useState<EventRow | null>(null);
  const [learningEvent, setLearningEvent] = useState<EventRow | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<EventRow | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const res = await adminGetAllEvents();
    if (res.success) {
      setEvents(res.data);
    } else {
      setFeedback({ type: "error", text: res.error || "Failed to load events" });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const showToast = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Quick Toggles
  const handleTogglePublish = async (event: EventRow) => {
    const res = await adminToggleEventPublish(event.id, event.publication_status);
    if (res.success && res.newStatus) {
      showToast(
        "success",
        `Event ${res.newStatus === "published" ? "published" : "moved to draft"}`
      );
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id ? { ...e, publication_status: res.newStatus! } : e
        )
      );
    } else {
      showToast("error", res.error || "Failed to toggle publication status");
    }
  };

  const handleToggleArchive = async (event: EventRow) => {
    const res = await adminToggleEventArchive(event.id, event.event_classification);
    if (res.success && res.newClassification) {
      showToast(
        "success",
        `Event classified as ${res.newClassification}`
      );
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? { ...e, event_classification: res.newClassification! }
            : e
        )
      );
    } else {
      showToast("error", res.error || "Failed to toggle archive classification");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEvent) return;
    const res = await adminDeleteEvent(deletingEvent.id);
    if (res.success) {
      showToast("success", `Event "${deletingEvent.title}" deleted.`);
      setEvents((prev) => prev.filter((e) => e.id !== deletingEvent.id));
      setDeletingEvent(null);
    } else {
      showToast("error", res.error || "Failed to delete event");
    }
  };

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    if (filterType === "upcoming" && e.event_classification !== "upcoming") return false;
    if (filterType === "archived" && e.event_classification !== "archived") return false;
    if (filterType === "published" && e.publication_status !== "published") return false;
    if (filterType === "draft" && e.publication_status !== "draft") return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchCategory = e.event_category?.toLowerCase().includes(q);
      const matchTags = e.tags?.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchCategory || matchTags;
    }
    return true;
  });

  const totalEvents = events.length;
  const publishedCount = events.filter((e) => e.publication_status === "published").length;
  const draftCount = events.filter((e) => e.publication_status === "draft").length;
  const upcomingCount = events.filter((e) => e.event_classification === "upcoming").length;
  const archivedCount = events.filter((e) => e.event_classification === "archived").length;

  return (
    <div className="space-y-6">
      {/* ── Toast notification ── */}
      {feedback && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl font-mono text-sm border backdrop-blur-md shadow-2xl transition-all ${
            feedback.type === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* ── Statistics Summary Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02]">
          <span className="font-mono text-[10px] text-foreground/40 uppercase block">TOTAL EVENTS</span>
          <span className="font-mono text-2xl font-black text-foreground">{totalEvents}</span>
        </div>
        <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5">
          <span className="font-mono text-[10px] text-green-400 uppercase block">PUBLISHED</span>
          <span className="font-mono text-2xl font-black text-green-400">{publishedCount}</span>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <span className="font-mono text-[10px] text-amber-400 uppercase block">DRAFTS</span>
          <span className="font-mono text-2xl font-black text-amber-400">{draftCount}</span>
        </div>
        <div className="p-4 rounded-xl border border-[#FF5500]/20 bg-[#FF5500]/5">
          <span className="font-mono text-[10px] text-[#FF5500] uppercase block">UPCOMING</span>
          <span className="font-mono text-2xl font-black text-[#FF5500]">{upcomingCount}</span>
        </div>
        <div className="p-4 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02]">
          <span className="font-mono text-[10px] text-foreground/40 uppercase block">ARCHIVED</span>
          <span className="font-mono text-2xl font-black text-foreground/70">{archivedCount}</span>
        </div>
      </div>

      {/* ── Action Toolbar & Filters ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02]">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Search events by title, category, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-foreground/[0.04] border border-foreground/[0.08] rounded-lg font-mono text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-[#FF5500]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-foreground/[0.04] border border-foreground/[0.06] rounded-lg text-xs font-mono">
          {(["all", "upcoming", "archived", "published", "draft"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer uppercase ${
                filterType === t
                  ? "bg-[#FF5500] text-white font-bold"
                  : "text-foreground/50 hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Add Event Button */}
        <button
          onClick={() => {
            setEditingEvent(null);
            setShowEventModal(true);
          }}
          className="cyber-btn px-4 py-2 bg-[#FF5500] hover:bg-[#FF6611] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(255,85,0,0.35)] shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      {/* ── Events List ── */}
      {loading ? (
        <div className="text-center py-24">
          <div className="inline-block w-8 h-8 border-2 border-[#FF5500]/30 border-t-[#FF5500] rounded-full animate-spin" />
          <p className="font-mono text-xs text-foreground/40 mt-3 uppercase tracking-wider">
            Loading events...
          </p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-2xl border border-dashed border-foreground/[0.1] bg-foreground/[0.01]">
          <p className="font-mono text-sm text-foreground/40 uppercase">No events found matching criteria.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-5 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] hover:bg-foreground/[0.03] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative group"
            >
              {/* Left Column: Image & Info */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Poster / Thumbnail */}
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-foreground/[0.08] bg-black/20 shrink-0 relative flex items-center justify-center">
                  {evt.image_url ? (
                    <img
                      src={evt.image_url}
                      alt={evt.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Calendar className="w-6 h-6 text-foreground/20" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="font-mono font-bold text-base text-foreground truncate">
                      {evt.title}
                    </h3>

                    {/* Slug link */}
                    <Link
                      href={`/events/${evt.slug || evt.id}`}
                      target="_blank"
                      className="font-mono text-[10px] text-[#FF5500] hover:underline flex items-center gap-1 px-2 py-0.5 rounded bg-[#FF5500]/10 border border-[#FF5500]/20"
                      title="Open public page"
                    >
                      <span>/events/{evt.slug || evt.id}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    {/* Category */}
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded border border-foreground/[0.1] text-foreground/50">
                      {evt.event_category || "Hackathon"}
                    </span>
                  </div>

                  <p className="font-mono text-xs text-foreground/50 truncate mb-2">
                    {evt.subtitle || evt.short_description || evt.description}
                  </p>

                  {/* Status Pills */}
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                    {/* Publication */}
                    <span
                      className={`px-2 py-0.5 rounded border font-bold uppercase ${
                        evt.publication_status === "published"
                          ? "bg-green-500/10 border-green-500/30 text-green-400"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      }`}
                    >
                      {evt.publication_status}
                    </span>

                    {/* Classification */}
                    <span
                      className={`px-2 py-0.5 rounded border font-bold uppercase ${
                        evt.event_classification === "upcoming"
                          ? "bg-[#FF5500]/10 border-[#FF5500]/30 text-[#FF5500]"
                          : "bg-purple-500/10 border-purple-500/30 text-purple-400"
                      }`}
                    >
                      {evt.event_classification}
                    </span>

                    {/* Registration Status */}
                    <span className="px-2 py-0.5 rounded border border-foreground/[0.1] text-foreground/60 uppercase">
                      Regs: {evt.status}
                    </span>

                    {/* Meta info */}
                    <span className="text-foreground/40">📅 {evt.date}</span>
                    {evt.location && <span className="text-foreground/40">📍 {evt.location}</span>}
                  </div>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-foreground/[0.06]">
                {/* Publish Toggle */}
                <button
                  onClick={() => handleTogglePublish(evt)}
                  className={`p-2 rounded-lg border font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                    evt.publication_status === "published"
                      ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                      : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                  }`}
                  title={evt.publication_status === "published" ? "Unpublish (set to draft)" : "Publish event"}
                >
                  {evt.publication_status === "published" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{evt.publication_status === "published" ? "Draft" : "Publish"}</span>
                </button>

                {/* Archive Toggle */}
                <button
                  onClick={() => handleToggleArchive(evt)}
                  className="p-2 rounded-lg border border-foreground/[0.1] text-foreground/60 hover:text-foreground font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  title={evt.event_classification === "upcoming" ? "Move to Archive" : "Restore to Upcoming"}
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>{evt.event_classification === "upcoming" ? "Archive" : "Upcoming"}</span>
                </button>

                {/* Edit Basic Info */}
                <button
                  onClick={() => {
                    setEditingEvent(evt);
                    setShowEventModal(true);
                  }}
                  className="px-3 py-2 rounded-lg border border-foreground/[0.1] hover:border-[#FF5500]/50 hover:text-[#FF5500] text-foreground/70 font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                {/* Schedule Manager */}
                <button
                  onClick={() => setScheduleEvent(evt)}
                  className="px-3 py-2 rounded-lg border border-foreground/[0.1] hover:border-blue-400/50 hover:text-blue-400 text-foreground/70 font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule</span>
                </button>

                {/* Gallery Manager */}
                <button
                  onClick={() => setGalleryEvent(evt)}
                  className="px-3 py-2 rounded-lg border border-foreground/[0.1] hover:border-purple-400/50 hover:text-purple-400 text-foreground/70 font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Gallery</span>
                </button>

                {/* Curriculum / Learning Cards */}
                <button
                  onClick={() => setLearningEvent(evt)}
                  className="px-3 py-2 rounded-lg border border-foreground/[0.1] hover:border-green-400/50 hover:text-green-400 text-foreground/70 font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Curriculum</span>
                </button>

                {/* Delete */}
                <button
                  onClick={() => setDeletingEvent(evt)}
                  className="p-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-colors cursor-pointer"
                  title="Delete event"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL 1: Create / Edit Event Basic Details ── */}
      {showEventModal && (
        <EventFormModal
          event={editingEvent}
          onClose={() => {
            setShowEventModal(false);
            setEditingEvent(null);
          }}
          onSaved={() => {
            setShowEventModal(false);
            setEditingEvent(null);
            showToast("success", "Event saved successfully!");
            loadEvents();
          }}
        />
      )}

      {/* ── MODAL 2: Dynamic Multi-Day Schedule Manager ── */}
      {scheduleEvent && (
        <ScheduleModal
          event={scheduleEvent}
          onClose={() => setScheduleEvent(null)}
          onSaved={() => {
            setScheduleEvent(null);
            showToast("success", "Event schedule updated successfully!");
            loadEvents();
          }}
        />
      )}

      {/* ── MODAL 3: Gallery Manager ── */}
      {galleryEvent && (
        <GalleryModal
          event={galleryEvent}
          onClose={() => setGalleryEvent(null)}
          onSaved={() => {
            showToast("success", "Gallery updated.");
            loadEvents();
          }}
        />
      )}

      {/* ── MODAL 4: Curriculum / Learning Cards Manager ── */}
      {learningEvent && (
        <LearningCardsModal
          event={learningEvent}
          onClose={() => setLearningEvent(null)}
          onSaved={() => {
            setLearningEvent(null);
            showToast("success", "Curriculum cards saved!");
            loadEvents();
          }}
        />
      )}

      {/* ── MODAL 5: Delete Confirmation Modal ── */}
      {deletingEvent && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDeletingEvent(null)}
        >
          <div
            className="w-full max-w-md bg-[#0a0c0f] border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-mono text-base font-bold text-red-400">
              DELETE EVENT
            </h3>
            <p className="font-mono text-xs text-foreground/80 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-white">"{deletingEvent.title}"</span>?
              This will remove all associated schedule days, sessions and gallery assets. Existing registrations will be safely preserved.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setDeletingEvent(null)}
                className="px-4 py-2 border border-foreground/[0.1] text-foreground/60 text-xs font-mono rounded-lg hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT 1: Event Form Modal (Create / Edit)
// ─────────────────────────────────────────────────────────────

function EventFormModal({
  event,
  onClose,
  onSaved,
}: {
  event: EventRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(event?.title || "");
  const [slug, setSlug] = useState(event?.slug || "");
  const [subtitle, setSubtitle] = useState(event?.subtitle || "");
  const [date, setDate] = useState(event?.date || "");
  const [startDate, setStartDate] = useState(
    event?.start_date ? event.start_date.slice(0, 16) : new Date().toISOString().slice(0, 16)
  );
  const [location, setLocation] = useState(event?.location || "");
  const [prize, setPrize] = useState(event?.prize || "");
  const [chain, setChain] = useState(event?.chain || "");
  const [teamMin, setTeamMin] = useState(event?.team_min || 1);
  const [teamMax, setTeamMax] = useState(event?.team_max || 4);
  const [category, setCategory] = useState(event?.event_category || "Hackathon");
  const [tags, setTags] = useState(event?.tags?.join(", ") || "");
  const [sponsors, setSponsors] = useState(event?.sponsors?.join(", ") || "");
  const [shortDesc, setShortDesc] = useState(event?.short_description || "");
  const [detailedDesc, setDetailedDesc] = useState(
    event?.detailed_description || event?.description || ""
  );

  const [status, setStatus] = useState<EventRegistrationStatus>(
    event?.status || "open"
  );
  const [publicationStatus, setPublicationStatus] = useState<EventPublicationStatus>(
    event?.publication_status || "published"
  );
  const [classification, setClassification] = useState<EventClassification>(
    event?.event_classification || "upcoming"
  );

  const [posterPreview, setPosterPreview] = useState<string | null>(event?.image_url || null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!event) {
      setSlug(slugifyEventTitle(val));
    }
  };

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPosterPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("title", title.trim());
    formData.set("slug", slug.trim());
    formData.set("subtitle", subtitle.trim());
    formData.set("date", date.trim());
    formData.set("start_date", startDate);
    formData.set("location", location.trim());
    formData.set("prize", prize.trim());
    formData.set("chain", chain.trim());
    formData.set("team_min", String(teamMin));
    formData.set("team_max", String(teamMax));
    formData.set("event_category", category);
    formData.set("tags", tags);
    formData.set("sponsors", sponsors);
    formData.set("short_description", shortDesc.trim());
    formData.set("detailed_description", detailedDesc.trim());
    formData.set("description", shortDesc.trim() || detailedDesc.trim());
    formData.set("status", status);
    formData.set("publication_status", publicationStatus);
    formData.set("event_classification", classification);

    const res = event
      ? await adminUpdateEvent(event.id, formData)
      : await adminCreateEvent(formData);

    if (res.success) {
      onSaved();
    } else {
      setError(res.error || "Failed to save event");
    }
    setSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl my-8 bg-[#0a0c0f] border border-[#FF5500]/30 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.08] bg-foreground/[0.02]">
          <h3 className="font-mono text-sm font-bold text-[#FF5500]">
            {event ? `EDIT_EVENT: ${event.title}` : "+ CREATE_NEW_EVENT"}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-foreground/[0.05] hover:bg-foreground/[0.1] flex items-center justify-center text-foreground/40 hover:text-foreground transition-colors cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs">
              {error}
            </div>
          )}

          {/* Poster Image */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-2">
              Event Poster / Thumbnail
            </label>
            <div
              onClick={() => posterInputRef.current?.click()}
              className="relative border-2 border-dashed border-foreground/[0.1] hover:border-[#FF5500]/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-foreground/[0.01]"
            >
              {posterPreview ? (
                <div className="relative group">
                  <img
                    src={posterPreview}
                    alt="Poster Preview"
                    className="max-h-48 rounded-lg object-contain shadow-md"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-white font-mono text-xs">
                    Click to replace
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Upload className="w-8 h-8 text-foreground/30 mx-auto mb-2" />
                  <p className="font-mono text-xs text-foreground/60">Click to upload poster image</p>
                  <p className="font-mono text-[10px] text-foreground/30 mt-1">PNG, JPG, WebP — max 5MB</p>
                </div>
              )}
              <input
                ref={posterInputRef}
                type="file"
                name="image"
                accept="image/*"
                className="hidden"
                onChange={handlePosterChange}
              />
            </div>
          </div>

          {/* Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. DECRYPTO"
                className="w-full px-3 py-2 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg font-mono text-xs text-foreground focus:border-[#FF5500] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-1">
                URL Slug * (/events/[slug])
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(slugifyEventTitle(e.target.value))}
                placeholder="e.g. decrypto"
                className="w-full px-3 py-2 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg font-mono text-xs text-[#FF5500] focus:border-[#FF5500] focus:outline-none"
              />
            </div>
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. 2 day bootcamp + 1 day hackathon"
              className="w-full px-3 py-2 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg font-mono text-xs text-foreground focus:border-[#FF5500] focus:outline-none"
            />
          </div>

          {/* Status Controls Row: Registration Status, Publication Status, Classification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02]">
            {/* Registration Status */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-1">
                Registration Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventRegistrationStatus)}
                className="w-full px-3 py-2 bg-[#0a0c0f] border border-foreground/[0.1] rounded-lg font-mono text-xs text-foreground focus:border-[#FF5500] focus:outline-none"
              >
                <option value="open">Open</option>
                <option value="soon">Coming Soon</option>
                <option value="closed">Closed / Concluded</option>
              </select>
            </div>

            {/* Publication Status */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-1">
                Publication Status
              </label>
              <select
                value={publicationStatus}
                onChange={(e) => setPublicationStatus(e.target.value as EventPublicationStatus)}
                className="w-full px-3 py-2 bg-[#0a0c0f] border border-foreground/[0.1] rounded-lg font-mono text-xs text-foreground focus:border-[#FF5500] focus:outline-none"
              >
                <option value="published">Published (Visible)</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </div>

            {/* Classification */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-1">
                Classification Tab
              </label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value as EventClassification)}
                className="w-full px-3 py-2 bg-[#0a0c0f] border border-foreground/[0.1] rounded-lg font-mono text-xs text-foreground focus:border-[#FF5500] focus:outline-none"
              >
                <option value="upcoming">Upcoming</option>
                <option value="archived">Archived / Past</option>
              </select>
            </div>
          </div>

          {/* Dates & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-1">
                Display Date *
              </label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. April 27–29, 2026"
                className="w-full px-3 py-2 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg font-mono text-xs text-foreground focus:border-[#FF5500] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-1">
                Start Date (ISO)
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg font-mono text-xs text-foreground focus:border-[#FF5500] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-1">
                Venue / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. APJ Abdul Kalam Lab, 4th Floor"
                className="w-full px-3 py-2 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg font-mono text-xs text-foreground focus:border-[#FF5500] focus:outline-none"
              />
            </div>
          </div>

          {/* Prize, Chain, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-1">
                Prize Pool
              </label>
              <input
                type="text"
                value={prize}
                onChange={(e) => setPrize(e.target.value)}
                placeholder="e.g. ₹15,000"
                className="w-full px-3 py-2 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg font-mono text-xs text-foreground focus:border-[#FF5500] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-1">
                Blockchain / Track
              </label>
              <input
                type="text"
                value={chain}
                onChange={(e) => setChain(e.target.value)}
                placeholder="e.g. Ethereum, Solana"
                className="w-full px-3 py-2 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg font-mono text-xs text-foreground focus:border-[#FF5500] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0c0f] border border-foreground/[0.1] rounded-lg font-mono text-xs text-foreground focus:border-[#FF5500] focus:outline-none"
              >
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Team Min / Max & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-1">
                Min Team Size
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={teamMin}
                onChange={(e) => setTeamMin(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg font-mono text-xs text-foreground focus:border-[#FF5500] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-1">
                Max Team Size
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={teamMax}
                onChange={(e) => setTeamMax(parseInt(e.target.value) || 4)}
                className="w-full px-3 py-2 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg font-mono text-xs text-foreground focus:border-[#FF5500] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Bootcamp, Solidity, dApps"
                className="w-full px-3 py-2 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg font-mono text-xs text-foreground focus:border-[#FF5500] focus:outline-none"
              />
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-1">
              Short Description (Card Summary)
            </label>
            <textarea
              rows={2}
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Brief summary for event cards..."
              className="w-full px-3 py-2 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg font-mono text-xs text-foreground focus:border-[#FF5500] focus:outline-none resize-none"
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-foreground/50 uppercase mb-1">
              Detailed Description (Event Detail Page)
            </label>
            <textarea
              rows={5}
              value={detailedDesc}
              onChange={(e) => setDetailedDesc(e.target.value)}
              placeholder="Complete event overview and details..."
              className="w-full px-3 py-2 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg font-mono text-xs text-foreground focus:border-[#FF5500] focus:outline-none resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-foreground/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-foreground/[0.1] text-foreground/50 font-mono text-xs rounded-lg hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cyber-btn px-6 py-2.5 bg-[#FF5500] hover:bg-[#FF6611] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg shadow-[0_0_12px_rgba(255,85,0,0.35)] disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Saving..." : event ? "Save Changes" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT 2: Dynamic Multi-Day Schedule Manager Modal
// ─────────────────────────────────────────────────────────────

function ScheduleModal({
  event,
  onClose,
  onSaved,
}: {
  event: EventRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [days, setDays] = useState<EventDayRow[]>([]);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true);
      const detail = await getPublicEventBySlug(event.slug || event.id);
      if (detail && detail.days && detail.days.length > 0) {
        setDays(detail.days);
      } else if (event.slug === "decrypto") {
        setDays(DEFAULT_DECRYPTO_DAYS);
      } else {
        // Initialize with default 1 Day
        setDays([
          {
            day_number: 1,
            label: "Day 1",
            heading: "Main Event",
            event_date: event.date,
            venue: event.location,
            slots: [],
          },
        ]);
      }
      setLoading(false);
    };
    loadSchedule();
  }, [event]);

  const activeDay = days[activeDayIdx] || null;

  const handleAddDay = () => {
    const nextNum = days.length + 1;
    const newDay: EventDayRow = {
      day_number: nextNum,
      label: `Day ${nextNum}`,
      heading: `Day ${nextNum} Schedule`,
      event_date: event.date,
      venue: event.location,
      slots: [],
    };
    setDays([...days, newDay]);
    setActiveDayIdx(days.length);
  };

  const handleDeleteDay = (idx: number) => {
    if (days.length <= 1) return;
    const next = days.filter((_, i) => i !== idx);
    setDays(next);
    setActiveDayIdx(Math.max(0, idx - 1));
  };

  const handleDayChange = (field: keyof EventDayRow, val: any) => {
    if (!activeDay) return;
    setDays((prev) =>
      prev.map((d, i) => (i === activeDayIdx ? { ...d, [field]: val } : d))
    );
  };

  const handleAddSession = () => {
    if (!activeDay) return;
    const newSession: EventSessionRow = {
      time_slot: "09:00–10:00",
      title: "New Session",
      is_highlight: false,
      is_break: false,
      sub_topics: [],
    };
    setDays((prev) =>
      prev.map((d, i) =>
        i === activeDayIdx
          ? { ...d, slots: [...(d.slots || []), newSession] }
          : d
      )
    );
  };

  const handleSessionChange = (
    sIdx: number,
    field: keyof EventSessionRow,
    val: any
  ) => {
    if (!activeDay) return;
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== activeDayIdx) return d;
        const slots = [...d.slots];
        slots[sIdx] = { ...slots[sIdx], [field]: val };
        return { ...d, slots };
      })
    );
  };

  const handleDeleteSession = (sIdx: number) => {
    if (!activeDay) return;
    setDays((prev) =>
      prev.map((d, i) =>
        i === activeDayIdx
          ? { ...d, slots: d.slots.filter((_, idx) => idx !== sIdx) }
          : d
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await adminSaveEventSchedule(event.id, days);
    if (res.success) {
      onSaved();
    } else {
      setError(res.error || "Failed to save schedule");
    }
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl my-8 bg-[#0a0c0f] border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.08] bg-foreground/[0.02]">
          <div>
            <h3 className="font-mono text-sm font-bold text-blue-400">
              SCHEDULE MANAGER: {event.title}
            </h3>
            <p className="font-mono text-[11px] text-foreground/40 mt-0.5">
              Add days and configure multi-session timeline slots
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-foreground/[0.05] hover:bg-foreground/[0.1] flex items-center justify-center text-foreground/40 hover:text-foreground cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Day Tabs Bar */}
              <div className="flex items-center justify-between gap-3 border-b border-foreground/[0.08] pb-3">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {days.map((d, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveDayIdx(idx)}
                      className={`px-4 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                        activeDayIdx === idx
                          ? "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                          : "text-foreground/50 hover:text-foreground bg-foreground/[0.04]"
                      }`}
                    >
                      {d.label || `Day ${idx + 1}`}
                    </button>
                  ))}
                  <button
                    onClick={handleAddDay}
                    className="px-3 py-1.5 rounded-lg border border-dashed border-blue-500/40 text-blue-400 hover:bg-blue-500/10 font-mono text-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Day</span>
                  </button>
                </div>

                {days.length > 1 && (
                  <button
                    onClick={() => handleDeleteDay(activeDayIdx)}
                    className="text-red-400 hover:text-red-300 font-mono text-xs transition-colors cursor-pointer"
                  >
                    Delete {activeDay?.label}
                  </button>
                )}
              </div>

              {/* Active Day Meta */}
              {activeDay && (
                <div className="p-4 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
                    <div>
                      <label className="block text-[10px] text-foreground/40 uppercase mb-1">
                        Day Label
                      </label>
                      <input
                        type="text"
                        value={activeDay.label}
                        onChange={(e) => handleDayChange("label", e.target.value)}
                        placeholder="e.g. Day 1"
                        className="w-full px-3 py-1.5 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg text-foreground focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-foreground/40 uppercase mb-1">
                        Heading
                      </label>
                      <input
                        type="text"
                        value={activeDay.heading}
                        onChange={(e) => handleDayChange("heading", e.target.value)}
                        placeholder="e.g. Intro & Fundamentals"
                        className="w-full px-3 py-1.5 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg text-foreground focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-foreground/40 uppercase mb-1">
                        Date
                      </label>
                      <input
                        type="text"
                        value={activeDay.event_date}
                        onChange={(e) => handleDayChange("event_date", e.target.value)}
                        placeholder="e.g. 27 April 2026"
                        className="w-full px-3 py-1.5 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg text-foreground focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-foreground/40 uppercase mb-1">
                        Venue
                      </label>
                      <input
                        type="text"
                        value={activeDay.venue || ""}
                        onChange={(e) => handleDayChange("venue", e.target.value)}
                        placeholder="e.g. Lab Block 4th Floor"
                        className="w-full px-3 py-1.5 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg text-foreground focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sessions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/60">
                    SESSIONS &amp; SLOTS ({activeDay?.slots?.length || 0})
                  </h4>
                  <button
                    onClick={handleAddSession}
                    className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg font-mono text-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Slot</span>
                  </button>
                </div>

                {activeDay && activeDay.slots && activeDay.slots.length > 0 ? (
                  activeDay.slots.map((slot, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3.5 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={slot.time_slot}
                          onChange={(e) =>
                            handleSessionChange(sIdx, "time_slot", e.target.value)
                          }
                          placeholder="09:00–10:20"
                          className="w-32 px-2.5 py-1.5 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg font-mono text-xs text-foreground focus:outline-none font-bold"
                        />
                        <input
                          type="text"
                          value={slot.title}
                          onChange={(e) =>
                            handleSessionChange(sIdx, "title", e.target.value)
                          }
                          placeholder="Session Title..."
                          className="flex-1 px-2.5 py-1.5 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg font-mono text-xs text-foreground focus:outline-none font-bold"
                        />

                        {/* Highlight Toggle */}
                        <label className="flex items-center gap-1.5 font-mono text-[11px] text-foreground/60 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!slot.is_highlight}
                            onChange={(e) =>
                              handleSessionChange(sIdx, "is_highlight", e.target.checked)
                            }
                            className="rounded accent-[#FF5500]"
                          />
                          <span>Highlight</span>
                        </label>

                        {/* Break Toggle */}
                        <label className="flex items-center gap-1.5 font-mono text-[11px] text-foreground/60 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!slot.is_break}
                            onChange={(e) =>
                              handleSessionChange(sIdx, "is_break", e.target.checked)
                            }
                            className="rounded accent-foreground"
                          />
                          <span>Break</span>
                        </label>

                        {/* Delete Session */}
                        <button
                          onClick={() => handleDeleteSession(sIdx)}
                          className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Subtopics comma-separated */}
                      <div>
                        <input
                          type="text"
                          value={slot.sub_topics?.join(", ") || ""}
                          onChange={(e) =>
                            handleSessionChange(
                              sIdx,
                              "sub_topics",
                              e.target.value
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean)
                            )
                          }
                          placeholder="Subtopics (comma-separated, e.g. Intro to Solidity, Remix IDE)"
                          className="w-full px-2.5 py-1 bg-foreground/[0.03] border border-foreground/[0.06] rounded font-mono text-[11px] text-foreground/60 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="font-mono text-xs text-foreground/30 italic py-4">
                    No sessions added yet for this day. Click "+ Add Slot" above.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-foreground/[0.08] bg-foreground/[0.02]">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-foreground/[0.1] text-foreground/60 font-mono text-xs rounded-lg hover:text-foreground cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="cyber-btn px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase rounded-lg shadow-[0_0_12px_rgba(59,130,246,0.35)] disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving Schedule..." : "Save Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT 3: Gallery Manager Modal
// ─────────────────────────────────────────────────────────────

function GalleryModal({
  event,
  onClose,
  onSaved,
}: {
  event: EventRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [gallery, setGallery] = useState<EventGalleryRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getPublicEventBySlug(event.slug || event.id).then((d) => {
      if (d) setGallery(d.gallery || []);
    });
  }, [event]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", caption);

    const res = await adminUploadGalleryImage(event.id, formData);
    if (res.success && res.image) {
      setGallery((prev) => [...prev, res.image!]);
      setCaption("");
      onSaved();
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    const res = await adminDeleteGalleryImage(id);
    if (res.success) {
      setGallery((prev) => prev.filter((g) => g.id !== id));
      onSaved();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0a0c0f] border border-purple-500/30 rounded-2xl p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-foreground/[0.08] pb-3">
          <h3 className="font-mono text-sm font-bold text-purple-400">
            GALLERY MANAGER: {event.title}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-foreground/[0.05] hover:bg-foreground/[0.1] flex items-center justify-center text-foreground/40 hover:text-foreground cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        {/* Upload Form */}
        <div className="p-4 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] flex items-center gap-3">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Optional image caption..."
            className="flex-1 px-3 py-2 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg font-mono text-xs text-foreground focus:outline-none"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="cyber-btn px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold uppercase rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? "Uploading..." : "Upload Photo"}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {gallery.map((img) => (
            <div
              key={img.id}
              className="relative aspect-video rounded-lg overflow-hidden border border-foreground/[0.1] group"
            >
              <img
                src={img.image_url}
                alt={img.caption || "Gallery"}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => img.id && handleDelete(img.id)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs"
                title="Delete photo"
              >
                ✕
              </button>
              {img.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-black/70 p-1 text-[9px] font-mono text-white/80 truncate">
                  {img.caption}
                </div>
              )}
            </div>
          ))}
          {gallery.length === 0 && (
            <p className="col-span-3 text-center py-10 font-mono text-xs text-foreground/30">
              No gallery images uploaded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT 4: Curriculum / Learning Cards Manager Modal
// ─────────────────────────────────────────────────────────────

function LearningCardsModal({
  event,
  onClose,
  onSaved,
}: {
  event: EventRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [cards, setCards] = useState<LearningCard[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPublicEventBySlug(event.slug || event.id).then((d) => {
      if (d && d.learning_outcomes && d.learning_outcomes.length > 0) {
        setCards(d.learning_outcomes);
      } else if (event.slug === "decrypto") {
        setCards(DEFAULT_DECRYPTO_LEARN_CARDS);
      } else {
        setCards([]);
      }
    });
  }, [event]);

  const handleAddCard = () => {
    setCards([
      ...cards,
      { title: "New Learning Outcome", sub: "Brief description of what participants learn", accent: false },
    ]);
  };

  const handleCardChange = (idx: number, field: keyof LearningCard, val: any) => {
    setCards((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: val } : c))
    );
  };

  const handleDeleteCard = (idx: number) => {
    setCards((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await adminSaveEventContent(event.id, {
      learning_outcomes: cards,
    });
    if (res.success) {
      onSaved();
    }
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0a0c0f] border border-green-500/30 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-foreground/[0.08] pb-3">
          <h3 className="font-mono text-sm font-bold text-green-400">
            CURRICULUM / LEARNING CARDS: {event.title}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-foreground/[0.05] hover:bg-foreground/[0.1] flex items-center justify-center text-foreground/40 hover:text-foreground cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 p-1">
          {cards.map((card, i) => (
            <div
              key={i}
              className="p-3 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] flex items-start gap-3"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => handleCardChange(i, "title", e.target.value)}
                    placeholder="Card Title (e.g. Solidity)"
                    className="flex-1 px-2.5 py-1.5 bg-foreground/[0.04] border border-foreground/[0.1] rounded font-mono text-xs text-foreground font-bold"
                  />
                  <label className="flex items-center gap-1.5 font-mono text-xs text-[#FF5500] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!card.accent}
                      onChange={(e) => handleCardChange(i, "accent", e.target.checked)}
                      className="rounded accent-[#FF5500]"
                    />
                    <span>Highlight</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={card.sub}
                  onChange={(e) => handleCardChange(i, "sub", e.target.value)}
                  placeholder="Card Subtitle (e.g. Write & deploy contracts on Ethereum)"
                  className="w-full px-2.5 py-1.5 bg-foreground/[0.04] border border-foreground/[0.1] rounded font-mono text-xs text-foreground/70"
                />
              </div>
              <button
                onClick={() => handleDeleteCard(i)}
                className="text-red-400 hover:text-red-300 p-1.5 cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={handleAddCard}
            className="w-full py-2.5 border border-dashed border-green-500/30 text-green-400 hover:bg-green-500/10 font-mono text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Learning Outcome Card</span>
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-foreground/[0.08] pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-foreground/[0.1] text-foreground/50 font-mono text-xs rounded-lg hover:text-foreground cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="cyber-btn px-5 py-2 bg-green-600 hover:bg-green-500 text-white font-mono text-xs font-bold uppercase rounded-lg shadow-[0_0_12px_rgba(34,197,94,0.35)] cursor-pointer"
          >
            {saving ? "Saving..." : "Save Cards"}
          </button>
        </div>
      </div>
    </div>
  );
}

