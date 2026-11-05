import TeamGrid from "@/components/TeamGrid";
import { getTeamMembers } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  let members: Awaited<ReturnType<typeof getTeamMembers>> = [];
  try {
    members = await getTeamMembers();
  } catch (err) {
    console.error("Failed to load team members:", err);
    members = [];
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="pt-20">
        <TeamGrid members={members} />
      </div>
    </main>
  );
}
