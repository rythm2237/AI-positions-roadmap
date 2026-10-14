export function isGenericVacancyPage(urlValue:string,title:string) {
  try {
    const url=new URL(urlValue);
    const path=decodeURIComponent(url.pathname).replace(/\/+$/,'').toLowerCase();
    if (/\b(job search|search results|browse jobs|job listings|jobs (?:in|near|for)|career opportunities)\b/i.test(title)) return true;
    return /\/(?:jobs?|careers?|vacancies)(?:\/search|\/search-results)?$/.test(path) && !/[?&](?:gh_jid|jobId|job_id|requisitionId|reqId)=/i.test(url.search);
  } catch {return true;}
}
