import { getEventsWithMedia } from "@/app/actions/admin";

export const metadata = {
  title: "Media",
  description: "Explore event media brought to you by our talented team",
};

export default async function MediaPage() {
  const { data: events, error } = await getEventsWithMedia();

  return (
    <main className="min-h-screen bg-background text-foreground py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 space-y-3 text-center">
          <span className="inline-flex rounded-full bg-accent/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-accent">
            Media Gallery
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Event Photos & Media</h1>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg">
            Browse imagery and videos captured by our talented team, grouped by event with title and description.
          </p>
        </div>

        {error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-900">
            <strong className="block text-lg font-semibold">Unable to load media.</strong>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        ) : !events || events.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700">
            No event media is available yet. Check back once uploads are published.
          </div>
        ) : (
          <div className="space-y-16">
            {events.map((event) => (
              <section key={event.id} className="rounded-3xl border border-slate-200 bg-slate-950/5 p-8 shadow-sm">
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="space-y-3">
                    <p className="text-sm uppercase tracking-[0.3em] text-accent">{event.date}</p>
                    <h2 className="text-3xl font-semibold tracking-tight">{event.title}</h2>
                    {event.description ? (
                      <p className="max-w-3xl text-sm leading-7 text-slate-600">{event.description}</p>
                    ) : (
                      <p className="max-w-3xl text-sm leading-7 text-slate-600">No event description was provided.</p>
                    )}
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700 shadow-sm">
                    {event.event_media?.length ?? 0} media item{event.event_media?.length === 1 ? "" : "s"}
                  </div>
                </div>

                {event.event_media && event.event_media.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {event.event_media.map((media) => (
                      <div key={media.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        {media.mime_type?.startsWith("video/") ? (
                          <video
                            controls
                            src={media.file_url}
                            className="h-64 w-full bg-black object-cover"
                          />
                        ) : (
                          <img
                            src={media.file_url}
                            alt={media.title ?? event.title}
                            className="h-64 w-full object-cover"
                          />
                        )}
                        <div className="space-y-2 p-4">
                          <p className="text-sm font-semibold text-slate-900">{media.title || "Untitled media"}</p>
                          {media.description && <p className="text-sm text-slate-600">{media.description}</p>}
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{media.mime_type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
                    No media uploaded for this event yet.
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
