"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";
import type { AdzunaSalaryIntelligence } from "@/lib/intelligence/adapters/adzunaAdapter";
import {
  COUNTRY_CATALOG,
  SUGGESTED_SALARY_COUNTRIES,
  resolveSelectableCountry,
  searchCountries,
} from "@/lib/intelligence/countryCatalog";
import {
  addCountrySelection,
  DEFAULT_SALARY_COUNTRIES,
  MAX_SALARY_COUNTRIES,
  removeCountrySelection,
  SALARY_COUNTRY_STORAGE_KEY,
  sanitizeCountrySelection,
} from "@/lib/intelligence/countrySelection";
import type { SalaryComparisonResponse, SalaryCountryResult } from "@/types/salaryComparison";

const recognizedCodes = new Set(COUNTRY_CATALOG.map((country) => country.code));

function localMoney(currency: string | null, value?: number) {
  if (value === undefined || !currency) return "Withheld";
  return `${currency} ${Math.round(value).toLocaleString()}`;
}

function statusCopy(result: SalaryCountryResult) {
  if (result.availability === "published") return "Verified snapshot";
  if (result.availability === "stale") return "Published snapshot · refresh due";
  if (result.availability === "provider-unsupported") return "Provider not currently available for this country";
  if (result.availability === "failed") return "Snapshot read failed";
  return "Awaiting verified data";
}

function evidenceLabel(data: AdzunaSalaryIntelligence) {
  const count = data.snapshot.salarySampleSize;
  if (count >= 20) return "Moderate evidence";
  if (count >= 3) return "Limited evidence";
  return "Insufficient evidence";
}

export default function GlobalSalaryComparison({ career }: { career: CareerWorkspaceData }) {
  const [selected, setSelected] = useState<string[]>([...DEFAULT_SALARY_COUNTRIES]);
  const [restored, setRestored] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [results, setResults] = useState<SalaryCountryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [detailCode, setDetailCode] = useState("gb");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SALARY_COUNTRY_STORAGE_KEY);
      if (stored) setSelected(sanitizeCountrySelection(JSON.parse(stored), recognizedCodes));
    } catch {
      setSelected([...DEFAULT_SALARY_COUNTRIES]);
    } finally {
      setRestored(true);
    }
  }, []);

  useEffect(() => {
    if (!restored) return;
    localStorage.setItem(SALARY_COUNTRY_STORAGE_KEY, JSON.stringify(selected));
  }, [restored, selected]);

  useEffect(() => {
    if (!restored) return;
    const controller = new AbortController();
    setLoading(true);
    setMessage("");
    const params = new URLSearchParams({ career: career.slug, countries: selected.join(","), type: "salary" });
    fetch(`/api/career-intelligence/snapshots?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(typeof body.message === "string" ? body.message : "Salary comparison is unavailable.");
        return body as SalaryComparisonResponse;
      })
      .then((body) => setResults(body.countries))
      .catch((error: Error) => {
        if (error.name !== "AbortError") setMessage("Salary comparison is temporarily unavailable. Please retry.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [career.slug, restored, selected]);

  const excluded = useMemo(() => new Set(selected), [selected]);
  const matches = useMemo(() => searchCountries(query, excluded).slice(0, 12), [excluded, query]);
  const suggested = SUGGESTED_SALARY_COUNTRIES.filter((code) => !excluded.has(code));

  function add(code: string) {
    const next = addCountrySelection(selected, code);
    if (next.result === "duplicate") setMessage("That country is already in your comparison.");
    if (next.result === "limit") setMessage(`You can compare up to ${MAX_SALARY_COUNTRIES} countries at once.`);
    if (next.result === "added") {
      setSelected(next.countries);
      setDetailCode(code);
      setQuery("");
      setMessage("");
    }
  }

  function remove(code: string) {
    const next = removeCountrySelection(selected, code);
    if (next.result === "minimum") return setMessage("Keep at least one country in the comparison.");
    setSelected(next.countries);
    if (detailCode === code) setDetailCode(next.countries[0]);
    setMessage("");
  }

  function onSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(0, matches.length - 1)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter" && matches[activeIndex]) {
      event.preventDefault();
      add(matches[activeIndex].code);
    } else if (event.key === "Escape") {
      setQuery("");
    }
  }

  const detail = results.find((result) => result.countryCode === detailCode) ?? results[0];
  const detailData = detail?.snapshot?.normalized_payload as unknown as AdzunaSalaryIntelligence | undefined;

  return <div className="space-y-6">
    <div>
      <p className="eyebrow">Verified job-listing evidence</p>
      <h3 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">Global Salary Comparison</h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Compare independently published salary snapshots in each country’s local currency. Small samples remain prominent and are never presented as high-confidence market estimates.</p>
    </div>

    <div className="rounded-2xl border border-white/10 bg-white/[.025] p-4">
      <label htmlFor="salary-country-search" className="text-xs font-semibold uppercase tracking-wide text-slate-400">Search and add country</label>
      <div className="relative mt-2 max-w-xl">
        <input ref={inputRef} id="salary-country-search" role="combobox" aria-autocomplete="list" aria-expanded={Boolean(query)} aria-controls="salary-country-results" aria-activedescendant={matches[activeIndex] ? `salary-country-${matches[activeIndex].code}` : undefined} value={query} onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }} onKeyDown={onSearchKeyDown} placeholder="Search by country name or ISO code" className="input-field min-h-12 w-full" />
        {query ? <ul id="salary-country-results" role="listbox" className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-white/10 bg-slate-950 p-1 shadow-2xl">
          {matches.length ? matches.map((country, index) => <li key={country.code} id={`salary-country-${country.code}`} role="option" aria-selected={index === activeIndex}><button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => add(country.code)} className={`flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-sm ${index === activeIndex ? "bg-cyan-400/10 text-white" : "text-slate-300"}`}><span>{country.name}</span><span className="text-xs uppercase text-slate-500">{country.code}</span></button></li>) : <li className="px-3 py-4 text-sm text-slate-400">No recognized country matches that search.</li>}
        </ul> : null}
      </div>
      <p className="mt-2 text-xs text-slate-500">Choose up to {MAX_SALARY_COUNTRIES} countries. Selection is saved in this browser.</p>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Selected comparison countries">{selected.map((code) => { const country = resolveSelectableCountry(code); return <span key={code} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/5 pl-3 pr-1 text-sm text-slate-200"><button type="button" onClick={() => setDetailCode(code)} className="min-h-9">{country?.name ?? code.toUpperCase()}</button><button type="button" onClick={() => remove(code)} aria-label={`Remove ${country?.name ?? code}`} className="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white">×</button></span>})}</div>

      <div className="mt-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Suggested markets</p><div className="mt-2 flex flex-wrap gap-2">{suggested.map((code) => { const country = resolveSelectableCountry(code); return <button type="button" key={code} onClick={() => add(code)} className="min-h-11 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-300 hover:border-cyan-300/30 hover:text-white">+ {country?.name}</button>})}</div></div>
      <p role="status" aria-live="polite" className="mt-3 text-xs text-amber-200/80">{message}</p>
    </div>

    {loading ? <div role="status" className="py-8 text-center text-sm text-slate-400">Loading stored salary snapshots…</div> : null}
    {!loading && results.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{results.map((result) => {
      const data = result.snapshot?.normalized_payload as unknown as AdzunaSalaryIntelligence | undefined;
      const snapshot = data?.snapshot;
      return <article key={result.countryCode} className={`rounded-2xl border p-4 ${detail?.countryCode === result.countryCode ? "border-cyan-300/30 bg-cyan-400/[.045]" : "border-white/10 bg-white/[.025]"}`}>
        <div className="flex items-start justify-between gap-3"><div><h4 className="font-semibold text-white">{result.countryName}</h4><p className="text-xs uppercase tracking-wide text-slate-500">{result.countryCode} · {result.currencyCode ?? "Currency unavailable"}</p></div><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{statusCopy(result)}</span></div>
        {snapshot ? <div className="mt-4 space-y-3"><div><p className="text-xs text-slate-500">Observed median annual salary</p><p className="mt-1 text-2xl font-semibold text-white">{localMoney(result.currencyCode, snapshot.observedMedian)}</p></div><dl className="grid grid-cols-2 gap-3 text-xs"><div><dt className="text-slate-500">Observed range</dt><dd className="mt-1 text-slate-200">{snapshot.observedRange ? `${localMoney(result.currencyCode, snapshot.observedRange.min)}–${localMoney(result.currencyCode, snapshot.observedRange.max)}` : "Insufficient sample"}</dd></div><div><dt className="text-slate-500">Verified salary matches</dt><dd className="mt-1 text-slate-200">{snapshot.salarySampleSize} of {snapshot.primaryMatchCount}</dd></div><div><dt className="text-slate-500">Employer-disclosed</dt><dd className="mt-1 text-slate-200">{snapshot.disclosedSalaryCount}</dd></div><div><dt className="text-slate-500">Provider-estimated</dt><dd className="mt-1 text-slate-200">{snapshot.predictedSalaryCount}</dd></div><div><dt className="text-slate-500">Returned sample</dt><dd className="mt-1 text-slate-200">{snapshot.sampleSize}</dd></div><div><dt className="text-slate-500">Evidence</dt><dd className="mt-1 text-slate-200">{evidenceLabel(data!)}</dd></div></dl><p className="text-xs text-slate-500">Published {new Date(result.snapshot!.published_at).toLocaleDateString()} · Source: Adzuna</p><button type="button" onClick={() => setDetailCode(result.countryCode)} className="min-h-11 text-xs font-semibold text-cyan-300 underline">Inspect country evidence</button></div> : <div className="mt-5 rounded-xl bg-slate-950/50 p-4"><p className="text-sm font-medium text-slate-200">{statusCopy(result)}</p><p className="mt-2 text-xs leading-5 text-slate-500">{result.providerSupported ? "No published salary snapshot is available yet. Selection does not trigger an unrestricted provider refresh." : "This country remains selectable, but the configured provider does not currently support it."}</p></div>}
      </article>})}</div> : null}

    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"><h4 className="font-semibold text-white">Cross-country visualization</h4><p className="mt-2 text-sm leading-6 text-slate-300">A shared-scale salary chart is intentionally unavailable because no verified exchange-rate source is configured. Original local-currency evidence is shown without implying that raw amounts in different currencies are directly comparable.</p></div>

    {detailData?.snapshot ? <CountryEvidence data={detailData} countryName={detail?.countryName ?? detailCode.toUpperCase()} /> : null}
  </div>;
}

function CountryEvidence({ data, countryName }: { data: AdzunaSalaryIntelligence; countryName: string }) {
  const { snapshot, histogram, history, currencyCode } = data;
  const format = (value: number) => localMoney(currencyCode, value);
  return <div className="rounded-2xl border border-white/10 p-4"><h4 className="font-semibold text-white">{countryName} evidence details</h4><p className="mt-2 text-sm text-slate-300">{snapshot.salarySampleSize} of {snapshot.primaryMatchCount} analyzed primary-title matches carried salary evidence. Employer-disclosed and provider-estimated values remain separate; adjacent and unmatched titles are excluded.</p><div className="mt-5 border-t border-white/10 pt-5"><h5 className="font-semibold text-white">Broad provider-query distribution</h5><p className="mt-2 text-xs text-amber-200/80">This histogram uses Adzuna’s broad keyword query “{snapshot.query}”. It is not the distribution of the verified title matches above and is presented as separate provider-query context.</p>{histogram.status === "available" ? <div className="mt-3 flex h-40 items-end gap-1" aria-label={`Broad salary histogram for ${countryName}`}>{histogram.buckets.slice(0, 24).map((bucket) => <div key={bucket.salary} title={`${format(bucket.salary)}: ${bucket.count}`} className="min-w-1 flex-1 rounded-t bg-amber-400/60" style={{ height: `${Math.max(5, bucket.count / Math.max(...histogram.buckets.map((item) => item.count)) * 100)}%` }} />)}</div> : <p className="mt-3 text-sm text-slate-400">{histogram.message}</p>}</div><div className="mt-5"><h5 className="font-semibold text-white">Provider-supplied salary history</h5>{history.status === "available" ? <div className="mt-2 grid gap-2 sm:grid-cols-2">{history.points.map((point) => <div key={point.month} className="rounded-xl bg-white/[.025] p-3 text-sm"><span className="text-slate-500">{point.month}</span><strong className="ml-3 text-white">{format(point.salary)}</strong></div>)}</div> : <p className="mt-2 text-sm text-slate-400">{history.message}</p>}</div><p className="mt-4 text-xs text-slate-500">Local currencies are not normalized for exchange rates, tax, purchasing power, or cost of living.</p></div>;
}
