export const REPAIR_KINDS:string[];
export function repairCandidates(kb:any,kind:string,limit?:number):{kind:string;candidates:Array<{id:string;kind:string;label:string;text:string;sourceType:string;sourceId:string}>;remaining:number;skipped:{sensitive:number;manual:number}};
export function validateRepairProposals(kb:any,kind:string,proposals:any[],allowedIds:string[]):any[];
export function applyRepair(kb:any,kind:string,proposals:any[],allowedIds:string[]):any;
