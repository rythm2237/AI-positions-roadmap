import { notFound, redirect } from "next/navigation";
import { CareerGenerationStatusPanel } from "@/components/career/CareerGenerationStatusPanel";
import CareerWorkspace from "@/components/career/CareerWorkspace";
import { createClient } from "@/lib/supabase/server";
import { dynamicCareerEngineEnabled, getOwnedGenerationRequest } from "@/lib/ai/careerGenerationServer";
import { validateCareerWorkspaceData } from "@/lib/careerContentValidation";

export const dynamic = "force-dynamic";

export default async function CareerGenerationRequestPage({ params }: { params: Promise<{ requestId: string }> }) {
  if (!dynamicCareerEngineEnabled()) notFound();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) redirect("/login");

  const { requestId } = await params;
  const owned = await getOwnedGenerationRequest(requestId, user.id);
  if (!owned) notFound();

  const workspaceResult = owned.career?.workspace_data
    ? validateCareerWorkspaceData(owned.career.workspace_data, String(owned.career.slug))
    : null;
  const workspace = workspaceResult?.valid ? workspaceResult.data : null;
  const status = String(owned.job.status);

  return (
    <main className="min-h-dvh bg-[#03050e] text-white">
      <div className="border-b border-white/10 px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a href="/careers" className="text-sm font-semibold text-white">AI Role Path <span className="text-violet-300">Career Discovery</span></a>
          <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs text-amber-100">Private request</span>
        </div>
      </div>
      <CareerGenerationStatusPanel
        requestId={requestId}
        title={String(owned.job.title)}
        initialStatus={status}
        errorCode={typeof owned.job.error_code === "string" ? owned.job.error_code : null}
        careerTitle={typeof owned.career?.title === "string" ? owned.career.title : null}
      />
      {workspace ? (
        <>
          <div className="mx-auto mt-5 max-w-7xl px-5 sm:px-8">
            <p className="rounded-xl border border-amber-300/15 bg-amber-300/[.06] px-4 py-3 text-sm leading-6 text-amber-50/90">
              This blueprint is a review draft. Learning sources are linked only when a verified catalog match exists; Admin review is required before this career can be published for everyone.
            </p>
          </div>
          <CareerWorkspace career={workspace} navigationBasePath={`/career-discovery/${requestId}`} />
        </>
      ) : null}
    </main>
  );
}
