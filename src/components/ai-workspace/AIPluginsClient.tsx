"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Project = { id: string; name: string; archived: boolean };
type Plugin = { id: string; display_name: string; status: "available" | "unavailable" | "disabled"; auth_kind: string; capabilities: Record<string, unknown> };
type Connection = { id: string; plugin_id: string; status: string; scopes: string[]; revoked_at: string | null };
type Permission = { connection_id: string; enabled: boolean; permissions: string[] };

export function AIPluginsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (pid: string) => {
    const response = await fetch(`/api/ai-workspace/plugins?projectId=${encodeURIComponent(pid)}`, { cache: "no-store" });
    if (!response.ok) throw new Error("PLUGIN_CATALOG_FAILED");
    const body = await response.json() as { plugins?: Plugin[]; connections?: Connection[]; projectPermissions?: Permission[] };
    setPlugins(body.plugins ?? []); setConnections(body.connections ?? []); setPermissions(body.projectPermissions ?? []);
  }, []);

  useEffect(() => { void (async () => {
    try {
      const response = await fetch("/api/ai-workspace/projects", { cache: "no-store" });
      if (!response.ok) throw new Error("UNAUTHENTICATED");
      const list = (((await response.json()) as { projects?: Project[] }).projects ?? []).filter(item => !item.archived);
      setProjects(list);
      if (list[0]) { setProjectId(list[0].id); await load(list[0].id); }
    } catch { setError("Connectors could not be loaded. Open AI Workspace and sign in or activate Guest access first."); }
    finally { setLoading(false); }
  })(); }, [load]);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#070912] text-slate-500">Loading connectors…</main>;
  return <main className="min-h-screen bg-[#070912] px-4 py-8 text-white sm:px-6"><div className="mx-auto max-w-5xl">
    <Link href="/ai" className="text-xs font-semibold uppercase tracking-[.16em] text-violet-300">← AI Workspace</Link>
    <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-semibold">Plugins & Tools</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Only integrations with real provider configuration can be enabled. Unavailable connectors stay visibly disabled; prompt text cannot grant tool permissions.</p></div>{projects.length ? <select value={projectId} onChange={event => { setProjectId(event.target.value); void load(event.target.value); }} className="h-11 rounded-xl border border-white/10 bg-[#10131f] px-3 text-sm">{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select> : null}</div>
    {error ? <p role="alert" className="mt-5 rounded-xl border border-rose-300/20 bg-rose-400/[.07] p-3 text-sm text-rose-200">{error}</p> : null}
    <div className="mt-7 grid gap-4 md:grid-cols-2">{plugins.length ? plugins.map(plugin => {
      const pluginConnections = connections.filter(connection => connection.plugin_id === plugin.id && !connection.revoked_at);
      const active = pluginConnections.find(connection => connection.status === "active");
      const permission = active ? permissions.find(item => item.connection_id === active.id) : undefined;
      const usable = plugin.status === "available" && active && permission?.enabled;
      return <article key={plugin.id} className="rounded-2xl border border-white/[.08] bg-white/[.025] p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-lg font-semibold">{plugin.display_name}</p><p className="mt-1 text-xs text-slate-600">{plugin.auth_kind} · {plugin.id}</p></div><span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${usable ? "border-emerald-300/20 text-emerald-200" : "border-white/10 text-slate-600"}`}>{usable ? "Enabled" : plugin.status}</span></div><p className="mt-4 text-xs leading-5 text-slate-500">Capabilities: {Object.keys(plugin.capabilities ?? {}).length ? JSON.stringify(plugin.capabilities) : "Not configured"}</p>{active ? <p className="mt-2 text-xs text-slate-500">Connection {active.status} · project permissions {permission?.enabled ? JSON.stringify(permission.permissions) : "disabled"}</p> : <p className="mt-2 text-xs text-slate-600">No active account connection.</p>}<button disabled className="mt-4 h-9 rounded-lg border border-white/10 px-3 text-xs text-slate-600 disabled:cursor-not-allowed">Provider setup required</button></article>;
    }) : <div className="md:col-span-2 rounded-2xl border border-dashed border-white/[.09] bg-white/[.015] px-6 py-14 text-center"><p className="text-sm font-semibold text-slate-300">No connector is configured</p><p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-slate-600">The workspace is intentionally fail-closed. OAuth/API integrations will appear here only after their provider configuration and credential storage path are established.</p></div>}</div>
  </div></main>;
}
