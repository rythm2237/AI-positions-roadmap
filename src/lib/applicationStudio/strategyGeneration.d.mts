export function sourceStrategy(knowledge:any,vacancy?:string):any;
export function strategyEvidenceRecords(knowledge:any):{entityId:string;kind:string;evidenceIds:string[]}[];
export function generateVerifiedStrategy(options:{generate:(repair:any)=>Promise<any>;knowledge:any;vacancy?:string;feedback?:string}):Promise<any>;
