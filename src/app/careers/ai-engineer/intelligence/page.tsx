import{permanentRedirect}from"next/navigation";
export default async function LegacyAIEngineerIntelligence({searchParams}:{searchParams:Promise<{country?:string;countries?:string}>}){const query=await searchParams,countries=query.countries??query.country;permanentRedirect(`/career-intelligence/occupations/ai-ml-engineering${countries?`?countries=${encodeURIComponent(countries)}`:""}`)}
