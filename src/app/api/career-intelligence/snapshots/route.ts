import { NextResponse } from "next/server";
import { countryCurrency, providerSupportsCountry, resolveSelectableCountry } from "@/lib/intelligence/countryCatalog";
import { normalizeRequestedCountries, salaryCountryAvailability } from "@/lib/intelligence/countrySelection";
import { latestPublishedMany, snapshotView } from "@/lib/intelligence/snapshotRepository";
import { freshnessDays, resolveCareer, resolveCountry, type SnapshotType } from "@/lib/intelligence/snapshotRegistry";
import type { SalaryComparisonResponse, SalaryCountryResult } from "@/types/salaryComparison";

const cacheHeaders = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" };

function safeRequestId() {
  return crypto.randomUUID();
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const career = params.get("career") ?? "";
  const type = params.get("type");
  const countriesParam = params.get("countries");

  if (!resolveCareer(career) || !(["market", "salary"] as Array<string | null>).includes(type)) {
    return NextResponse.json({ availability: "unavailable", message: "Unsupported snapshot query." }, { status: 422 });
  }

  if (!countriesParam) {
    const country = params.get("country") ?? "";
    if (!resolveCountry(country)) {
      return NextResponse.json({ availability: "unavailable", message: "Unsupported snapshot query." }, { status: 422 });
    }
    try {
      return NextResponse.json(await snapshotView(career, country.toLowerCase(), type as SnapshotType), { headers: cacheHeaders });
    } catch {
      return NextResponse.json({ availability: "no-verified-data", message: "No verified snapshot is available." }, { status: 200 });
    }
  }

  if (type !== "salary") {
    return NextResponse.json({ message: "Multi-country retrieval currently supports salary snapshots only." }, { status: 422 });
  }

  const parsed = normalizeRequestedCountries(countriesParam);
  if (parsed.error || parsed.countries.some((country) => !resolveSelectableCountry(country))) {
    return NextResponse.json({ message: "Invalid country comparison request." }, { status: 422 });
  }

  const requestId = safeRequestId();
  try {
    const snapshots = await latestPublishedMany(career, parsed.countries, "salary");
    const now = Date.now();
    const results: SalaryCountryResult[] = parsed.countries.map((countryCode) => {
      const metadata = resolveSelectableCountry(countryCode)!;
      const snapshot = snapshots.get(countryCode) ?? null;
      if (!snapshot) {
        const supported = providerSupportsCountry(countryCode);
        return {
          countryCode,
          countryName: metadata.name,
          currencyCode: countryCurrency(countryCode),
          providerSupported: supported,
          availability: salaryCountryAvailability(false, false, supported),
          snapshot: null,
        };
      }
      const ageDays = Math.max(0, Math.floor((now - Date.parse(snapshot.captured_at)) / 86400000));
      const stale = ageDays > freshnessDays("salary");
      return {
        countryCode,
        countryName: metadata.name,
        currencyCode: snapshot.currency_code ?? countryCurrency(countryCode),
        providerSupported: providerSupportsCountry(countryCode),
        availability: salaryCountryAvailability(true, stale, providerSupportsCountry(countryCode)),
        freshness: stale ? "Stale" : `Updated ${ageDays} days ago`,
        snapshot,
      };
    });
    const response: SalaryComparisonResponse = { career, snapshotType: "salary", requestId, countries: results };
    return NextResponse.json(response, { headers: cacheHeaders });
  } catch {
    console.error("Salary comparison snapshot read failed", { requestId, errorCode: "SNAPSHOT_READ_FAILED" });
    return NextResponse.json({ message: "Salary comparison is temporarily unavailable.", requestId }, { status: 503 });
  }
}
