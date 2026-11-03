import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicEventBySlug } from "@/app/actions/events";
import EventDetailClient from "@/components/events/EventDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  if (!event) {
    return {
      title: "Event Not Found | WEB.3 BMSIT",
      description: "The requested event could not be found or is not published.",
    };
  }
  return {
    title: `${event.title} | WEB.3 BMSIT`,
    description: event.short_description || event.description,
    openGraph: {
      title: `${event.title} — WEB.3 Club`,
      description: event.short_description || event.description,
      images: event.image_url ? [event.image_url] : [],
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground pt-20">
      <EventDetailClient event={event} />
    </main>
  );
}

