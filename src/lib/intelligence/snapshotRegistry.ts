import "server-only";
import careers from "../../../content/intelligence/career-query-registry.json";
import countries from "../../../content/intelligence/country-registry.json";
import policy from "../../../content/intelligence/refresh-policy.json";
export type SnapshotType="market"|"salary";
export type CareerQuery=(typeof careers)[number]; export type CountryConfig=(typeof countries)[number];
export function resolveCareer(slug:string){return careers.find(item=>item.enabled&&item.careerSlug===slug)??null}
export function resolveCountry(code:string){return countries.find(item=>item.configured&&item.productCode===code.toLowerCase())??null}
export function scheduledCountries(){return countries.filter(item=>item.scheduled)}
export function freshnessDays(type:SnapshotType){return type==="market"?policy.market.staleAfterDays:policy.salary.staleAfterDays}
export const refreshPolicy=policy;
