export type Knowledge = {schemaVersion:number;revision:number;sources:any[];entities:any[];claims:any[];declined:string[]};
export function emptyKnowledge():Knowledge;
export function stableId(scope:string,value:unknown):string;
export function knowledgeSources(kb:Knowledge):Record<string,string>;
export function importKnowledge(kb:Knowledge,input:{text:string;type?:string;sections?:any[];label?:string},at?:string):Knowledge;
export function confirmFact(kb:Knowledge,input:any,at?:string):Knowledge;
export function retractFact(kb:Knowledge,id:string):Knowledge;
export function assertKnowledge(kb:unknown):Knowledge;
