export type PageProviderStatus="rate-limited"|"authentication-error"|"unsupported"|"provider-error";
export async function collectAdzunaPages<T extends{id?:string}>(options:{maxResults:number;pageSize:number;loadPage:(page:number,pageSize:number)=>Promise<{count?:number;results?:T[]}>}){
 const maximum=Math.min(200,Math.max(1,options.maxResults)),pageSize=Math.min(50,Math.max(1,options.pageSize)),records:T[]=[],seen=new Set<string>();let providerReportedCount:number|undefined,pagesRequested=0,partial=false;
 pageLoop:for(let page=1;page<=Math.ceil(maximum/pageSize);page++){
  let response:{count?:number;results?:T[]}|undefined;
  for(let attempt=0;attempt<3;attempt++)try{response=await options.loadPage(page,pageSize);break}catch(error){const status=(error as{providerStatus?:PageProviderStatus}).providerStatus;if(["rate-limited","authentication-error","unsupported"].includes(status??""))throw error;if(attempt===2){if(records.length){partial=true;break pageLoop}throw error}await new Promise(resolve=>setTimeout(resolve,Math.min(20,5*(attempt+1))))}
  pagesRequested++;providerReportedCount??=response?.count;const pageRecords=response?.results??[];for(const record of pageRecords){const key=record.id??JSON.stringify(record);if(!seen.has(key)&&records.length<maximum){seen.add(key);records.push(record)}}if(!pageRecords.length||pageRecords.length<pageSize||records.length>=maximum)break;
 }
 return{providerReportedCount,pagesRequested,recordsRetrieved:records.length,partial,results:records};
}
