"use client";

import Link from "next/link";
import { FormEvent, Fragment, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Project = { id: string; name: string; description?: string; instructions?: string; archived: boolean };
type Conversation = { id: string; project_id: string; title: string; archived: boolean; pinned: boolean; updated_at: string };
type ChatMessage = { id: string; role: "user" | "assistant"; content: string; request_id?: string | null; metadata?: Record<string, unknown>; created_at?: string };
type Skill = { id: string; version: number; name: string; description: string; category: string; project_id: string | null; owner_id: string | null };
type SavedPrompt = { id: string; project_id: string | null; name: string; content: string; archived: boolean };
type PromptProfile = "normal" | "professional";
type WorkspaceMode = "auto" | "fast" | "best";
type SessionPayload = { kind: "registered" | "guest"; planKey: string | null; balance: Record<string, string>; entitlements: { enabled?: boolean; modes?: string[]; models?: string[] } };

type Panel = "chat" | "skills" | "prompts" | "usage";

const errorLabels: Record<string, string> = {
  UNAUTHENTICATED: "Sign in or activate a Guest Code to use the workspace.",
  ACCESS_DISABLED: "AI access is disabled for this account. Review your plan or ask an administrator to enable an allowance.",
  NO_AFFORDABLE_ROUTE: "This request does not fit inside your remaining AI budget. Choose Fast/Normal or increase the allowance.",
  PROFESSIONAL_MODE_BUDGET_UNAVAILABLE: "Professional mode needs budget for both prompt enhancement and the final answer. Use Normal or increase the allowance.",
  REQUEST_ALREADY_EXISTS_OR_LIMIT_REACHED: "A request is already running or the current usage limit has been reached.",
  RATE_LIMITED: "Too many requests were sent in a short period. Try again shortly.",
  PROVIDER_NOT_CONFIGURED: "The AI provider is not configured in this environment.",
  PROVIDER_UNAVAILABLE: "The AI provider could not complete this request.",
  CANCELLED: "Generation stopped.",
};

function usd(micros: unknown) {
  try { return `$${(Number(BigInt(String(micros ?? "0"))) / 1_000_000).toFixed(4)}`; }
  catch { return "$0.0000"; }
}

async function readError(response: Response) {
  const body = await response.json().catch(() => null) as { error?: string } | null;
  return body?.error ?? `HTTP_${response.status}`;
}

function InlineText({ text }: { text: string }) {
  const chunks = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return <>{chunks.map((chunk, index) => {
    if (chunk.startsWith("`") && chunk.endsWith("`")) return <code key={index} className="rounded bg-white/[.07] px-1.5 py-0.5 font-mono text-[.9em] text-cyan-100">{chunk.slice(1, -1)}</code>;
    if (chunk.startsWith("**") && chunk.endsWith("**")) return <strong key={index} className="font-semibold text-slate-100">{chunk.slice(2, -2)}</strong>;
    return <Fragment key={index}>{chunk}</Fragment>;
  })}</>;
}

function TextSection({ value }: { value: string }) {
  const lines = value.split("\n");
  const nodes: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { nodes.push(<div key={`space-${i}`} className="h-2" />); i++; continue; }
    if (line.trim().startsWith("|") && i + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) {
      const table: string[][] = [];
      table.push(line.split("|").map(v => v.trim()).filter(Boolean));
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        table.push(lines[i].split("|").map(v => v.trim()).filter(Boolean)); i++;
      }
      nodes.push(<div key={`table-${i}`} className="my-3 overflow-x-auto rounded-xl border border-white/[.08]"><table className="w-full min-w-[480px] text-left text-sm"><tbody>{table.map((row, r) => <tr key={r} className={r === 0 ? "bg-white/[.04] text-slate-100" : "border-t border-white/[.06] text-slate-300"}>{row.map((cell, c) => <td key={c} className="px-3 py-2 align-top"><InlineText text={cell} /></td>)}</tr>)}</tbody></table></div>); continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)/);
    if (heading) { nodes.push(<div key={i} className="mt-4 font-semibold text-white"><InlineText text={heading[2]} /></div>); i++; continue; }
    const bullet = line.match(/^\s*[-*]\s+(.+)/);
    if (bullet) { nodes.push(<div key={i} className="flex gap-2 py-0.5 text-slate-300"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-300" /><span><InlineText text={bullet[1]} /></span></div>); i++; continue; }
    const numbered = line.match(/^\s*(\d+)\.\s+(.+)/);
    if (numbered) { nodes.push(<div key={i} className="flex gap-2 py-0.5 text-slate-300"><span className="min-w-5 text-violet-300">{numbered[1]}.</span><span><InlineText text={numbered[2]} /></span></div>); i++; continue; }
    nodes.push(<p key={i} className="leading-7 text-slate-300"><InlineText text={line} /></p>); i++;
  }
  return <>{nodes}</>;
}

function MessageContent({ content }: { content: string }) {
  const parts = content.split(/```([\w+-]*)\n([\s\S]*?)```/g);
  const out: ReactNode[] = [];
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i]) out.push(<TextSection key={`t-${i}`} value={parts[i]} />);
    const language = parts[i + 1];
    const code = parts[i + 2];
    if (code !== undefined) out.push(<div key={`c-${i}`} className="my-3 overflow-hidden rounded-xl border border-white/[.08] bg-slate-950/80"><div className="flex items-center justify-between border-b border-white/[.06] px-3 py-2 text-[11px] uppercase tracking-wider text-slate-500"><span>{language || "code"}</span><button type="button" onClick={() => navigator.clipboard.writeText(code)} className="text-slate-400 hover:text-white">Copy</button></div><pre className="overflow-x-auto p-4 text-sm leading-6 text-slate-200"><code>{code}</code></pre></div>);
  }
  return <div className="space-y-1">{out}</div>;
}

function StatusPill({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-white/[.08] bg-white/[.035] px-2.5 py-1 text-[11px] text-slate-400">{children}</span>;
}

export function AIWorkspaceClient() {
  const [booting, setBooting] = useState(true);
  const [entryRequired, setEntryRequired] = useState(false);
  const [guestCode, setGuestCode] = useState("");
  const [guestError, setGuestError] = useState("");
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillId, setSkillId] = useState("");
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [composer, setComposer] = useState("");
  const [mode, setMode] = useState<WorkspaceMode>("auto");
  const [promptProfile, setPromptProfile] = useState<PromptProfile>("normal");
  const [professionalNotice, setProfessionalNotice] = useState(false);
  const [professionalCost, setProfessionalCost] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>("chat");
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [usage, setUsage] = useState<Record<string, unknown> | null>(null);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const messagesEnd = useRef<HTMLDivElement | null>(null);

  const loadUsage = useCallback(async () => {
    const response = await fetch("/api/ai-workspace/usage", { cache: "no-store" });
    if (!response.ok) return;
    const body = await response.json() as { usage?: Record<string, unknown> };
    setUsage(body.usage ?? null);
  }, []);

  const loadMessages = useCallback(async (id: string) => {
    if (!id) { setMessages([]); return; }
    const response = await fetch(`/api/ai-workspace/conversations/${encodeURIComponent(id)}/messages?limit=200`, { cache: "no-store" });
    if (!response.ok) { setError(errorLabels[await readError(response)] ?? "Conversation could not be loaded."); return; }
    const body = await response.json() as { messages?: ChatMessage[] };
    setMessages(body.messages ?? []);
  }, []);

  const loadProjectExtras = useCallback(async (id: string) => {
    if (!id) return;
    const [skillResponse, promptResponse] = await Promise.all([
      fetch(`/api/ai-workspace/skills?projectId=${encodeURIComponent(id)}`, { cache: "no-store" }),
      fetch(`/api/ai-workspace/saved-prompts?projectId=${encodeURIComponent(id)}`, { cache: "no-store" }),
    ]);
    if (skillResponse.ok) setSkills(((await skillResponse.json()) as { skills?: Skill[] }).skills ?? []);
    if (promptResponse.ok) setPrompts(((await promptResponse.json()) as { prompts?: SavedPrompt[] }).prompts ?? []);
  }, []);

  const createConversation = useCallback(async (pid: string, title = "New conversation") => {
    const response = await fetch("/api/ai-workspace/conversations", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: pid, title }),
    });
    if (!response.ok) throw new Error(await readError(response));
    const body = await response.json() as { conversation: Conversation };
    setConversations(current => [body.conversation, ...current]);
    setConversationId(body.conversation.id);
    setMessages([]);
    setPanel("chat");
    return body.conversation;
  }, []);

  const loadProject = useCallback(async (pid: string) => {
    setProjectId(pid);
    const response = await fetch(`/api/ai-workspace/conversations?projectId=${encodeURIComponent(pid)}`, { cache: "no-store" });
    if (!response.ok) throw new Error(await readError(response));
    const body = await response.json() as { conversations?: Conversation[] };
    const available = (body.conversations ?? []).filter(item => !item.archived);
    setConversations(available);
    await loadProjectExtras(pid);
    const first = available.find(item => item.pinned) ?? available[0];
    if (first) { setConversationId(first.id); await loadMessages(first.id); }
    else await createConversation(pid);
  }, [createConversation, loadMessages, loadProjectExtras]);

  const bootstrap = useCallback(async () => {
    setBooting(true); setError("");
    const sessionResponse = await fetch("/api/ai-workspace/session", { cache: "no-store" });
    if (sessionResponse.status === 401) { setEntryRequired(true); setBooting(false); return; }
    if (!sessionResponse.ok) { setError("Workspace session could not be loaded."); setBooting(false); return; }
    const sessionBody = await sessionResponse.json() as { session: SessionPayload };
    setSession(sessionBody.session); setEntryRequired(false);
    const projectsResponse = await fetch("/api/ai-workspace/projects", { cache: "no-store" });
    if (!projectsResponse.ok) { setError("Projects could not be loaded."); setBooting(false); return; }
    const projectBody = await projectsResponse.json() as { projects?: Project[] };
    let available = (projectBody.projects ?? []).filter(item => !item.archived);
    if (!available.length) {
      const create = await fetch("/api/ai-workspace/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "My Workspace", description: "Personal AI workspace", instructions: "" }) });
      if (create.ok) available = [((await create.json()) as { project: Project }).project];
    }
    setProjects(available);
    if (available[0]) await loadProject(available[0].id);
    await loadUsage();
    setBooting(false);
  }, [loadProject, loadUsage]);

  useEffect(() => {
    const saved = window.localStorage.getItem("ai-workspace-prompt-profile");
    if (saved === "professional" || saved === "normal") setPromptProfile(saved);
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, streamText]);

  const chooseProfile = (profile: PromptProfile) => {
    setPromptProfile(profile);
    window.localStorage.setItem("ai-workspace-prompt-profile", profile);
    if (profile === "professional") {
      setProfessionalNotice(true);
      window.setTimeout(() => setProfessionalNotice(false), 9000);
    } else setProfessionalNotice(false);
  };

  const activateGuest = async (event: FormEvent) => {
    event.preventDefault(); setGuestError("");
    const response = await fetch("/api/ai-workspace/guest/activate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: guestCode }) });
    if (!response.ok) { setGuestError("Guest Code is invalid, expired, already used, or unavailable on this device."); return; }
    setGuestCode(""); await bootstrap();
  };

  const submit = async () => {
    const content = composer.trim();
    if (!content || !projectId || !conversationId || sending) return;
    setComposer(""); setSending(true); setStreamText(""); setError(""); setProfessionalCost(null); setStatus(promptProfile === "professional" ? "Enhancing your prompt…" : "Thinking…");
    const optimistic: ChatMessage = { id: `local-${crypto.randomUUID()}`, role: "user", content };
    setMessages(current => [...current, optimistic]);
    const controller = new AbortController(); abortRef.current = controller;
    try {
      const response = await fetch("/api/ai-workspace/chat", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({ projectId, conversationId, requestId: crypto.randomUUID(), content, mode, promptProfile, skillId: skillId || undefined }),
      });
      if (!response.ok || !response.body) throw new Error(await readError(response));
      const reader = response.body.getReader();
      const decoder = new TextDecoder(); let buffer = ""; let finalText = "";
      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        let boundary: number;
        while ((boundary = buffer.indexOf("\n\n")) >= 0) {
          const frame = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 2);
          const raw = frame.split("\n").find(line => line.startsWith("data:"))?.slice(5).trim();
          if (!raw) continue;
          const event = JSON.parse(raw) as Record<string, unknown>;
          if (event.type === "text" && typeof event.delta === "string") { finalText += event.delta; setStreamText(finalText); setStatus("Generating…"); }
          else if (event.type === "prompt_profile") { setStatus("Prompt enhanced · generating answer…"); if (typeof event.enhancementCostMicros === "string") setProfessionalCost(event.enhancementCostMicros); }
          else if (event.type === "route") setStatus(promptProfile === "professional" ? "Professional route selected" : "Route selected");
          else if (event.type === "error") throw new Error(String(event.error ?? "EXECUTION_FAILED"));
          else if (event.type === "done") setStatus("");
        }
        if (done) break;
      }
      setStreamText(""); await loadMessages(conversationId); await loadUsage();
    } catch (reason) {
      setStreamText("");
      if (controller.signal.aborted) setError("Generation stopped.");
      else { const code = reason instanceof Error ? reason.message : "EXECUTION_FAILED"; setError(errorLabels[code] ?? `Request failed: ${code}`); await loadMessages(conversationId); }
    } finally { abortRef.current = null; setSending(false); setStatus(""); }
  };

  const saveCurrentPrompt = async () => {
    const content = composer.trim(); if (!content || !projectId) return;
    const name = content.replace(/\s+/g, " ").slice(0, 54) + (content.length > 54 ? "…" : "");
    const response = await fetch("/api/ai-workspace/saved-prompts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId, name, content }) });
    if (response.ok) { const body = await response.json() as { prompt: SavedPrompt }; setPrompts(current => [body.prompt, ...current]); setPanel("prompts"); }
  };

  const createProject = async (event: FormEvent) => {
    event.preventDefault(); const name = newProjectName.trim(); if (!name) return;
    const response = await fetch("/api/ai-workspace/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description: "", instructions: "" }) });
    if (!response.ok) { setError("Project could not be created."); return; }
    const project = ((await response.json()) as { project: Project }).project;
    setProjects(current => [project, ...current]); setNewProjectName(""); setNewProjectOpen(false); await loadProject(project.id);
  };

  const filteredConversations = useMemo(() => conversations.filter(item => !search || item.title.toLowerCase().includes(search.toLowerCase())), [conversations, search]);
  const selectedProject = projects.find(project => project.id === projectId);
  const selectedConversation = conversations.find(conversation => conversation.id === conversationId);
  const remaining = usage?.availableMicros ?? session?.balance?.availableMicros ?? "0";

  if (booting) return <main className="flex min-h-screen items-center justify-center bg-[#070912] text-slate-300"><div className="text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-300/20 border-t-violet-300" /><p className="mt-4 text-sm">Opening AI Workspace…</p></div></main>;

  if (entryRequired) return <main className="min-h-screen bg-[radial-gradient(circle_at_top,#17152b_0,#090b14_42%,#06070d_100%)] px-5 py-12 text-white"><div className="mx-auto max-w-md pt-[8vh]"><div className="rounded-[28px] border border-violet-300/15 bg-slate-950/70 p-6 shadow-2xl shadow-violet-950/20 backdrop-blur-xl sm:p-8"><p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-300">AI Role Path</p><h1 className="mt-3 text-3xl font-semibold">AI Workspace</h1><p className="mt-3 text-sm leading-6 text-slate-400">Sign in with your AI Role Path account or activate a private Guest Code. Guest access does not require an email.</p><form onSubmit={activateGuest} className="mt-7 space-y-3"><label className="text-xs font-medium text-slate-300">Guest Code</label><input value={guestCode} onChange={e => setGuestCode(e.target.value)} autoComplete="off" spellCheck={false} placeholder="CAREER-…" className="h-12 w-full rounded-xl border border-white/10 bg-white/[.045] px-4 font-mono text-sm outline-none transition focus:border-violet-300/50" /><button className="h-12 w-full rounded-xl bg-violet-500 font-semibold text-white transition hover:bg-violet-400">Activate Guest Access</button></form>{guestError ? <p role="alert" className="mt-3 text-sm text-rose-300">{guestError}</p> : null}<div className="my-6 flex items-center gap-3 text-xs text-slate-600"><span className="h-px flex-1 bg-white/[.07]" />or<span className="h-px flex-1 bg-white/[.07]" /></div><Link href="/login?next=/ai" className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[.035] text-sm font-semibold text-slate-200 hover:bg-white/[.06]">Sign in to AI Role Path</Link><p className="mt-5 text-xs leading-5 text-slate-500">AI usage is protected by server-side cost limits. Guest codes, device credentials and session secrets are never stored in plaintext.</p></div></div></main>;

  return <main className="h-[100dvh] overflow-hidden bg-[#070912] text-white">
    {professionalNotice ? <div className="fixed bottom-24 right-4 z-[80] max-w-sm rounded-2xl border border-violet-300/25 bg-[#151329]/95 p-4 shadow-2xl shadow-violet-950/40 backdrop-blur-xl sm:right-6"><div className="flex items-start gap-3"><span className="mt-0.5 rounded-lg bg-violet-400/15 px-2 py-1 text-sm text-violet-200">Pro</span><div><p className="text-sm font-semibold text-white">Professional prompt mode</p><p className="mt-1 text-xs leading-5 text-slate-400">Your request is first rewritten into a structured professional prompt, then answered. The extra enhancement step can use more AI budget.</p></div><button onClick={() => setProfessionalNotice(false)} className="text-slate-500 hover:text-white" aria-label="Close">×</button></div></div> : null}

    <div className="flex h-full">
      {mobileNav ? <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileNav(false)} /> : null}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[286px] flex-col border-r border-white/[.06] bg-[#0b0d17]/98 transition-transform lg:static lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between border-b border-white/[.06] px-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-violet-300">AI Role Path</p><p className="text-sm font-semibold">AI Workspace</p></div><button onClick={() => setMobileNav(false)} className="text-xl text-slate-500 lg:hidden">×</button></div>
        <div className="p-3"><button onClick={() => void createConversation(projectId)} disabled={!projectId} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-500 text-sm font-semibold transition hover:bg-violet-400 disabled:opacity-40"><span className="text-lg">＋</span> New chat</button></div>
        <div className="px-3"><div className="mb-2 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-slate-600">Projects</p><button onClick={() => setNewProjectOpen(true)} className="text-lg text-slate-500 hover:text-white" aria-label="New project">＋</button></div><div className="space-y-1">{projects.map(project => <button key={project.id} onClick={() => void loadProject(project.id)} className={`w-full truncate rounded-lg px-3 py-2 text-left text-sm ${project.id === projectId ? "bg-violet-400/10 text-violet-100" : "text-slate-400 hover:bg-white/[.04] hover:text-white"}`}>{project.name}</button>)}</div></div>
        <div className="mx-3 mt-4 border-t border-white/[.06] pt-3"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search chats" className="h-9 w-full rounded-lg border border-white/[.07] bg-white/[.025] px-3 text-xs text-slate-300 outline-none focus:border-violet-300/30" /></div>
        <div className="mt-2 flex-1 overflow-y-auto px-3 pb-3">{filteredConversations.map(conversation => <button key={conversation.id} onClick={() => { setConversationId(conversation.id); setPanel("chat"); setMobileNav(false); void loadMessages(conversation.id); }} className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm ${conversation.id === conversationId ? "bg-white/[.055] text-white" : "text-slate-400 hover:bg-white/[.035]"}`}><span className="text-slate-600">{conversation.pinned ? "◆" : "◇"}</span><span className="truncate">{conversation.title}</span></button>)}</div>
        <nav className="border-t border-white/[.06] p-3"><div className="grid grid-cols-3 gap-1">{([['skills','Skills'],['prompts','Prompts'],['usage','Usage']] as const).map(([key,label]) => <button key={key} onClick={() => { setPanel(key); setMobileNav(false); }} className={`rounded-lg px-2 py-2 text-xs ${panel === key ? "bg-violet-400/10 text-violet-200" : "text-slate-500 hover:bg-white/[.035] hover:text-slate-300"}`}>{label}</button>)}</div><div className="mt-3 flex items-center justify-between rounded-lg border border-white/[.06] bg-white/[.02] px-3 py-2"><div><p className="text-xs text-slate-300">{session?.kind === "guest" ? "Guest access" : "AI Role Path account"}</p><p className="mt-0.5 text-[10px] text-slate-600">Remaining {usd(remaining)}</p></div><span className={`h-2 w-2 rounded-full ${session?.entitlements?.enabled ? "bg-emerald-300" : "bg-amber-300"}`} /></div></nav>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[.06] bg-[#090b14]/85 px-4 backdrop-blur-xl sm:px-5"><div className="flex min-w-0 items-center gap-3"><button onClick={() => setMobileNav(true)} className="text-xl text-slate-400 lg:hidden">☰</button><div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{selectedConversation?.title || selectedProject?.name || "AI Workspace"}</p><p className="truncate text-[11px] text-slate-600">{selectedProject?.name ?? "No project selected"}</p></div></div><div className="flex items-center gap-2"><StatusPill>{mode.toUpperCase()}</StatusPill><StatusPill>{promptProfile === "professional" ? "Professional" : "Normal"}</StatusPill><StatusPill>{usd(remaining)} left</StatusPill></div></header>

        {panel === "chat" ? <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto"><div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">{messages.length === 0 && !streamText ? <div className="mx-auto max-w-2xl py-[12vh] text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-300/15 bg-violet-400/[.08] text-xl text-violet-200">✦</div><h1 className="mt-5 text-2xl font-semibold sm:text-3xl">What are you working on?</h1><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">Use Normal for direct, efficient requests. Switch to Professional when you want the platform to engineer your prompt first for a more structured response.</p><div className="mt-6 flex flex-wrap justify-center gap-2">{["Build a project plan", "Improve my CV", "Debug this architecture", "Research a career move"].map(example => <button key={example} onClick={() => setComposer(example)} className="rounded-full border border-white/[.08] bg-white/[.025] px-3 py-2 text-xs text-slate-400 hover:border-violet-300/20 hover:text-white">{example}</button>)}</div></div> : <div className="space-y-7">{messages.map(message => <article key={message.id} className={message.role === "user" ? "ml-auto max-w-2xl" : "max-w-3xl"}>{message.role === "user" ? <div className="rounded-2xl rounded-br-md border border-violet-300/10 bg-violet-400/[.08] px-4 py-3 text-sm leading-6 text-slate-200 whitespace-pre-wrap">{message.content}</div> : <div className="group text-sm"><div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.14em] text-violet-300"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-400/10 text-xs">✦</span> AI Workspace</div><MessageContent content={message.content} /><button type="button" onClick={() => navigator.clipboard.writeText(message.content)} className="mt-3 opacity-0 transition group-hover:opacity-100 text-xs text-slate-600 hover:text-slate-300">Copy response</button></div>}</article>)}{streamText ? <article className="max-w-3xl"><div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.14em] text-violet-300"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-400/10 text-xs">✦</span>{status || "Generating"}</div><MessageContent content={streamText} /><span className="ml-1 inline-block h-4 w-1 animate-pulse bg-violet-300" /></article> : null}<div ref={messagesEnd} /></div>}</div></div>
          <div className="shrink-0 border-t border-white/[.05] bg-[#080a12]/95 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:px-5"><div className="mx-auto max-w-4xl"><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><div className="flex rounded-lg border border-white/[.07] bg-white/[.02] p-1"><button onClick={() => chooseProfile("normal")} className={`rounded-md px-3 py-1.5 text-xs font-medium ${promptProfile === "normal" ? "bg-white/[.08] text-white" : "text-slate-500"}`}>Normal</button><button onClick={() => chooseProfile("professional")} className={`rounded-md px-3 py-1.5 text-xs font-medium ${promptProfile === "professional" ? "bg-violet-500/20 text-violet-200" : "text-slate-500"}`}>Professional</button></div><div className="flex items-center gap-1">{(["auto","fast","best"] as WorkspaceMode[]).map(value => <button key={value} onClick={() => setMode(value)} className={`rounded-md px-2.5 py-1.5 text-[11px] uppercase tracking-wide ${mode === value ? "bg-cyan-300/[.09] text-cyan-200" : "text-slate-600 hover:text-slate-300"}`}>{value}</button>)}</div></div>{promptProfile === "professional" ? <div className="mb-2 flex items-center justify-between rounded-lg border border-violet-300/10 bg-violet-400/[.035] px-3 py-2 text-[11px] text-slate-500"><span><strong className="text-violet-200">Professional:</strong> prompt enhancement runs before the answer and costs extra AI usage.</span>{professionalCost ? <span className="ml-3 shrink-0 text-violet-300">Enhancement {usd(professionalCost)}</span> : null}</div> : null}<div className="rounded-2xl border border-white/[.09] bg-white/[.035] p-2 shadow-2xl shadow-black/20 focus-within:border-violet-300/25"><textarea value={composer} onChange={e => setComposer(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void submit(); } }} disabled={sending} rows={3} placeholder={promptProfile === "professional" ? "Describe the outcome you want — Professional mode will structure the prompt first…" : "Message AI Workspace…"} className="max-h-44 min-h-[62px] w-full resize-none bg-transparent px-2 py-2 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-600 disabled:opacity-70" /><div className="flex items-center justify-between gap-3 px-1 pb-1"><div className="flex min-w-0 items-center gap-2"><select value={skillId} onChange={e => setSkillId(e.target.value)} className="max-w-[170px] rounded-lg border border-white/[.06] bg-[#10121c] px-2 py-1.5 text-[11px] text-slate-400 outline-none"><option value="">Auto skill</option>{skills.map(skill => <option key={`${skill.id}:${skill.version}`} value={skill.id}>{skill.name} v{skill.version}</option>)}</select><button type="button" onClick={() => void saveCurrentPrompt()} disabled={!composer.trim()} className="rounded-lg px-2 py-1.5 text-[11px] text-slate-600 hover:bg-white/[.04] hover:text-slate-300 disabled:opacity-30">Save prompt</button></div>{sending ? <button onClick={() => abortRef.current?.abort()} className="flex h-9 items-center gap-2 rounded-xl border border-rose-300/15 bg-rose-400/[.06] px-3 text-xs font-semibold text-rose-200"><span className="h-2.5 w-2.5 rounded-[2px] bg-rose-200" /> Stop</button> : <button onClick={() => void submit()} disabled={!composer.trim() || !conversationId} className="flex h-9 items-center gap-2 rounded-xl bg-violet-500 px-4 text-xs font-semibold text-white hover:bg-violet-400 disabled:opacity-30">Send <span>↑</span></button>}</div></div>{error ? <p role="alert" className="mt-2 px-2 text-xs text-rose-300">{error}</p> : status && !streamText ? <p className="mt-2 px-2 text-xs text-violet-300">{status}</p> : null}</div></div>
        </div> : <div className="flex-1 overflow-y-auto"><div className="mx-auto max-w-4xl px-5 py-8"><button onClick={() => setPanel("chat")} className="mb-6 text-xs text-violet-300">← Back to chat</button>{panel === "skills" ? <><p className="text-xs uppercase tracking-[.16em] text-violet-300">Skills</p><h2 className="mt-2 text-2xl font-semibold">Specialist instructions</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Skills add task-specific professional behavior without exposing or overriding protected platform policy.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{skills.map(skill => <button key={`${skill.id}:${skill.version}`} onClick={() => { setSkillId(skill.id); setPanel("chat"); }} className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4 text-left hover:border-violet-300/20"><div className="flex items-center justify-between"><p className="font-semibold text-white">{skill.name}</p><StatusPill>v{skill.version}</StatusPill></div><p className="mt-2 text-xs leading-5 text-slate-500">{skill.description || skill.category}</p></button>)}</div></> : panel === "prompts" ? <><p className="text-xs uppercase tracking-[.16em] text-violet-300">Saved Prompts</p><h2 className="mt-2 text-2xl font-semibold">Reusable requests</h2><div className="mt-6 space-y-3">{prompts.length ? prompts.map(prompt => <div key={prompt.id} className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-white">{prompt.name}</p><p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs leading-5 text-slate-500">{prompt.content}</p></div><button onClick={() => { setComposer(prompt.content); setPanel("chat"); }} className="shrink-0 rounded-lg border border-violet-300/15 px-3 py-2 text-xs text-violet-200">Use</button></div></div>) : <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-600">Save a prompt from the composer to see it here.</p>}</div></> : <><p className="text-xs uppercase tracking-[.16em] text-violet-300">Usage</p><h2 className="mt-2 text-2xl font-semibold">AI budget & consumption</h2><p className="mt-2 text-sm text-slate-500">Financial enforcement happens on the server before provider execution.</p><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[["Remaining",usage?.availableMicros],["Reserved",usage?.reservedMicros],["Today",usage?.dailyUsedMicros],["This period",usage?.monthlyUsedMicros],["Daily limit",usage?.dailyLimitMicros],["Period limit",usage?.monthlyLimitMicros]].map(([label,value]) => <div key={String(label)} className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4"><p className="text-xs text-slate-500">{String(label)}</p><p className="mt-2 text-xl font-semibold text-white">{usd(value)}</p></div>)}</div><div className="mt-5 rounded-2xl border border-violet-300/10 bg-violet-400/[.03] p-4 text-xs leading-5 text-slate-500"><strong className="text-violet-200">Professional mode</strong> uses a separately metered prompt-enhancement request before the final answer. Both maximum costs are reserved before either provider call, so selecting Professional cannot bypass your hard limit.</div></>}</div></div>}
      </section>
    </div>

    {newProjectOpen ? <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4"><form onSubmit={createProject} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#10121c] p-5 shadow-2xl"><div className="flex items-center justify-between"><h2 className="font-semibold">Create project</h2><button type="button" onClick={() => setNewProjectOpen(false)} className="text-slate-500">×</button></div><p className="mt-2 text-xs leading-5 text-slate-500">Projects isolate instructions, conversations, memory, files, skills and usage context.</p><input autoFocus value={newProjectName} onChange={e => setNewProjectName(e.target.value)} placeholder="Project name" className="mt-5 h-11 w-full rounded-xl border border-white/10 bg-white/[.04] px-3 text-sm outline-none focus:border-violet-300/30" /><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setNewProjectOpen(false)} className="rounded-xl px-4 py-2 text-sm text-slate-400">Cancel</button><button className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold">Create</button></div></form></div> : null}
  </main>;
}
