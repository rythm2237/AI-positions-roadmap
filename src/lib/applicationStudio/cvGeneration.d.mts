export class CVEvidenceError extends Error {issue:string;details:any;constructor(issue:string,details?:any);}
export function cvEvidenceFailureCode(error:any):string;
export function generationEvidenceRecords(knowledge:any):any[];
export function generateGroundedCV(options:{generate:(repair:any)=>Promise<any>;review:(input:any)=>Promise<any>;knowledge:any;strategy:any;current?:any[];rejected?:string[];language?:string;prepareDraft?:(value:any)=>any;finalizeSections?:(sections:any[])=>any[];reviewDocument?:boolean}):Promise<any>;
