import "server-only";
import { createStructuredAdminResponse } from "@/lib/admin/ai/openaiAdminClient";

export type ResourceDiscoveryRequest={careerTitle:string;stageTitle:string;topic:string};
export type ResourceCandidate={title:string;provider:string;type:"Documentation"|"Learning Path"|"Course"|"Article"|"Practice"|"Video";url:string;whyUseful:string;authorityTier:"official"|"vendor"|"university-certification"|"professional-provider"|"youtube-last-resort";directYoutube:boolean;sourceDomain:string};
export type ResourceDiscoveryResult={candidates:ResourceCandidate[];researchNotes:string[]};

const schema={type:"object",additionalProperties:false,required:["candidates","researchNotes"],properties:{candidates:{type:"array",minItems:1,maxItems:8,items:{type:"object",additionalProperties:false,required:["title","provider","type","url","whyUseful","authorityTier","directYoutube","sourceDomain"],properties:{title:{type:"string"},provider:{type:"string"},type:{type:"string",enum:["Documentation","Learning Path","Course","Article","Practice","Video"]},url:{type:"string"},whyUseful:{type:"string"},authorityTier:{type:"string",enum:["official","vendor","university-certification","professional-provider","youtube-last-resort"]},directYoutube:{type:"boolean"},sourceDomain:{type:"string"}}}},researchNotes:{type:"array",items:{type:"string"}}}} as const;

const instructions=`You are the verified learning-resource researcher for Career OS Admin Studio.
Use web search. Return only resources whose URL you found during the current web research.
Prioritize sources in this exact order: (1) official documentation or official academy, (2) vendor training from the relevant technology company, (3) university or recognized certification organization, (4) reputable professional education provider, (5) direct YouTube only if no suitable higher-tier resource can be found.
Do not return a direct youtube.com or youtu.be URL when an adequate higher-tier resource exists.
A website that embeds a YouTube video is not considered a direct YouTube resource; classify based on the destination URL.
Do not invent course names, URLs, providers, certifications, prices, durations, or availability.
Prefer stable canonical course/documentation pages over search-result or tracking URLs.
Return concise research notes describing any gaps or uncertainty. This output is a candidate list for human review and must never publish automatically.`;

export async function discoverLearningResources(request:ResourceDiscoveryRequest){
  const result=await createStructuredAdminResponse<ResourceDiscoveryResult>({name:"career_os_resource_discovery",description:"Verified learning-resource candidates for Admin Studio human review.",schema,instructions,input:`Find authoritative learning resources for this Career OS learning topic:\n${JSON.stringify(request,null,2)}`,tools:[{type:"web_search"}]});
  return {...result,candidates:result.candidates.filter(candidate=>{try{const url=new URL(candidate.url);const directYoutube=url.hostname==="youtube.com"||url.hostname.endsWith(".youtube.com")||url.hostname==="youtu.be";candidate.directYoutube=directYoutube;candidate.sourceDomain=url.hostname;return url.protocol==="https:"}catch{return false}})};
}
