export type Knowledge = {schemaVersion:number;revision:number;sources:any[];entities:any[];claims:any[];declined:string[]};
export function emptyKnowledge():Knowledge;
export function stableId(scope:string,value:unknown):string;
export function knowledgeSources(kb:Knowledge):Record<string,string>;
export function importKnowledge(kb:Knowledge,input:{text:string;type?:string;sections?:any[];label?:string},at?:string):Knowledge;
export function importSemanticKnowledge(kb:Knowledge,input:{text:string;type?:string;label?:string;records:any[]},at?:string):Knowledge;
export function confirmFact(kb:Knowledge,input:any,at?:string):Knowledge;
export function retractFact(kb:Knowledge,id:string):Knowledge;
export function assertKnowledge(kb:unknown):Knowledge;

export function updateEntityMetadata(kb:Knowledge,input:{entityId:string;metadata:Record<string,string|number|boolean|null>}):Knowledge;
export function moveKnowledgeFact(kb:Knowledge,input:{claimId:string;kind:string;label:string}):Knowledge;
export function confirmFactBatch(kb:Knowledge,proposals:any[]):Knowledge;
export function questionKey(question:string):string;
export function confirmedClarifications(kb:Knowledge|null,vacancy?:string,legacy?:Record<string,unknown>):{question:string;answer:string;evidenceId:string;verification:string}[];
export function unresolvedQuestions(questions:string[],answers?:{question:string}[]):string[];
