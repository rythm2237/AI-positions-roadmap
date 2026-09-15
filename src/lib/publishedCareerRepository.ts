import 'server-only';

import type { CareerWorkspaceData } from '@/types/careerWorkspace';

type PublishedCareerRow = {
  content_json: unknown;
  published_at: string | null;
};

type PublishedCareer = {
  slug: string;
  title: string;
  shortDescription: string;
  skills: unknown[];
  data: CareerWorkspaceData;
};

const PUBLISHED_CAREER_REQUEST_TIMEOUT_MS = 4_000;

function getPublicSupabaseConfig(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return {
    url: url.replace(/\/+$/, ''),
    anonKey,
  };
}

function isPublishedCareer(value: unknown): value is PublishedCareer {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<PublishedCareer>;
  const data = candidate.data as Partial<CareerWorkspaceData> | undefined;
  return (
    typeof candidate.slug === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.shortDescription === 'string' &&
    Array.isArray(candidate.skills) &&
    Boolean(data && typeof data === 'object') &&
    typeof data?.slug === 'string' &&
    typeof data?.title === 'string'
  );
}

export async function getPublishedCareer(slug: string): Promise<PublishedCareer | null> {
  const config = getPublicSupabaseConfig();
  if (!config) {
    return null;
  }

  try {
    const response = await fetch(
      `${config.url}/rest/v1/careers?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=content_json,published_at&limit=1`,
      {
        method: 'GET',
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(PUBLISHED_CAREER_REQUEST_TIMEOUT_MS),
      }
    );

    if (!response.ok) {
      return null;
    }

    const rows = (await response.json()) as PublishedCareerRow[];
    const content = rows[0]?.content_json;
    return isPublishedCareer(content) ? content : null;
  } catch {
    return null;
  }
}
