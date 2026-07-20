import assert from"node:assert/strict";
import{BLS_OEWS_APPROVED_SOCS,BLS_OEWS_DATATYPE_URL,BLS_OEWS_ENDPOINT,BlsOewsAdapter,blsOewsSeriesId}from"../src/lib/intelligence/adapters/blsOewsAdapter.ts";
import{BlsMweAdapter}from"../src/lib/intelligence/adapters/blsMweAdapter.ts";
import{runGenericOfficialRefresh}from"../src/lib/intelligence/genericRefreshEngine.ts";

const mappings=BLS_OEWS_APPROVED_SOCS.map((socCode,index)=>({id:`20000000-0000-4000-8000-00000000000${index+1}`,socCode,title:`SOC ${socCode}`,mappingVersion:"us-soc-2026.1",reviewStatus:"approved"as const}));
const baseSelection={occupationFamilyId:"10000000-0000-4000-8000-000000000001",occupationFamilySlug:"ai-ml-engineering",countries:["us"],querySize:3,queryDefinitionVersion:"us-bls-oews-latest.1"};
const drySelection={...baseSelection,capabilities:["salary"as const,"employment_count"as const],mode:"dry-run"as const};
const approved={sourceId:"30000000-0000-4000-8000-000000000002",sourceSlug:"us-bls-oews",countryCode:"us",capability:"salary"as const,allowedOrigins:["https://api.bls.gov"],approval:{approvalStatus:"approved"as const,commercialUse:"yes"as const,redistribution:"yes"as const,aggregation:"yes"as const,derivedStatistics:"yes"as const,localStorage:"yes"as const,attributionText:"Source: U.S. Bureau of Labor Statistics",reviewedAt:"2026-07-20T00:00:00Z",expiresAt:"2027-07-20T00:00:00Z"}};
const deps={async approvalFor(slug:string,_country:string,capability:string){return slug==="us-bls-oews"?{...approved,capability:capability as typeof approved.capability}:null},async persistCandidate(){throw new Error("DRY_RUN_MUST_NOT_PERSIST")},async publishCandidate(){throw new Error("DRY_RUN_MUST_NOT_PUBLISH")}};

let calls=0;const dryAdapter=new BlsOewsAdapter(mappings,async()=>{calls++;throw new Error("DRY_RUN_MUST_NOT_FETCH")});
const dry=await runGenericOfficialRefresh(drySelection,dryAdapter,deps);assert.equal(dry.providerRequests,0);assert.equal(calls,0);assert.ok(dry.plan);assert.equal(dry.plan.items.length,2);assert.ok(dry.plan.items.every(item=>item.sourceSlug==="us-bls-oews"&&item.endpoint===BLS_OEWS_ENDPOINT));

let mweCalls=0;const guardedMwe=new BlsMweAdapter([{...mappings[0],weight:.45}],async()=>{mweCalls++;throw new Error("MWE_MUST_NOT_FETCH")});
await assert.rejects(()=>runGenericOfficialRefresh({...baseSelection,capabilities:["salary"],mode:"candidate-generation"},guardedMwe,deps),/SOURCE_NOT_APPROVED:us-bls-mwe-unapproved:salary/);assert.equal(mweCalls,0);

const salaryTypes=["13","08","04","03"];
function salarySeries(years:number[],partialYear?:number){return mappings.flatMap(mapping=>salaryTypes.map(type=>({seriesID:blsOewsSeriesId(mapping.socCode,type),data:years.filter(year=>year!==partialYear||mapping.socCode==="15-2051").map(year=>({year:String(year),period:"A01",periodName:"Annual",value:type==="08"&&mapping.socCode==="15-2051"?"#":String(100000+year),footnotes:type==="08"?[{code:"#",text:"Wage estimate is not available"}]:[],releaseDate:`${year+1}-04-01`}))})))}
function response(series:unknown[]){return new Response(JSON.stringify({status:"REQUEST_SUCCEEDED",Results:{series}}),{status:200})as Awaited<ReturnType<typeof fetch>>}
async function retrieveSalary(series:unknown[]){const adapter=new BlsOewsAdapter(mappings,async()=>response(series));const plan=await adapter.plan({...baseSelection,capabilities:["salary"],mode:"candidate-generation"});return{adapter,item:plan.items[0],release:await adapter.retrieve(plan.items[0])}}

const latest=await retrieveSalary(salarySeries([2024,2025]));assert.equal(latest.release.providerReleaseId,"bls-oews-2025-a01-national");assert.equal(latest.release.referencePeriodStart,"2025-05-01");assert.equal(latest.release.referencePeriodEnd,"2025-05-31");assert.equal(latest.release.releaseDate,"2026-04-01");assert.equal(latest.release.sourceMetadata.datatypeMetadataUrl,BLS_OEWS_DATATYPE_URL);
const partial=await retrieveSalary(salarySeries([2024,2025],2025));assert.equal(partial.release.providerReleaseId,"bls-oews-2024-a01-national");assert.equal(partial.release.records.every(record=>(record as {data:Array<{year:string}>}).data[0].year==="2024"),true);
const may2024=await retrieveSalary(salarySeries([2024]));assert.equal(may2024.release.providerReleaseId,"bls-oews-2024-a01-national");assert.equal(may2024.release.referencePeriodStart,"2024-05-01");assert.equal(may2024.release.referencePeriodEnd,"2024-05-31");

const mismatched=salarySeries([2024]);mismatched[0]={...mismatched[0],seriesID:"OEUN000000000000015205199"};await assert.rejects(()=>retrieveSalary(mismatched),/BLS_OEWS_SERIES_(SET|ID)_MISMATCH/);
const observations=await may2024.adapter.normalize(may2024.item,may2024.release);assert.equal(observations.length,11);assert.equal(observations.some(item=>item.metricCode==="median_hourly_wage"&&item.occupationMappingId===mappings[0].id),false);const suppressed=(may2024.release.records as Array<{seriesID:string;data:Array<{value:string;footnotes:unknown[]}>}>).find(item=>item.seriesID===blsOewsSeriesId("15-2051","08"));assert.equal(suppressed?.data[0].value,"#");assert.deepEqual(suppressed?.data[0].footnotes,[{code:"#",text:"Wage estimate is not available"}]);assert.ok(observations.every(item=>item.evidence.datatypeMetadataUrl===BLS_OEWS_DATATYPE_URL));assert.doesNotMatch(JSON.stringify(observations),/weight/i);
console.log("OEWS latest-complete selection, partial-release fallback, May 2024 fixture, strict series identity, suppression preservation, zero-call dry run, and MWE isolation checks passed.");
