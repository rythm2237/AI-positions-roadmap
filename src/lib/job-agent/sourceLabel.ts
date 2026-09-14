export function userFacingJobSource(source: string) {
  if (/^(?:Greenhouse|Lever|Workday):/i.test(source)) return "Company website";
  if (/^Apify:linkedin$/i.test(source) || /linkedin/i.test(source)) return "LinkedIn";
  return "Job board";
}
