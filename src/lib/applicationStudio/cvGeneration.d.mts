export class CVEvidenceError extends Error {issue:string;constructor(issue:string);}
export function generationEvidenceRecords(knowledge:any):any[];
export function generateGroundedCV(options:{generate:(repair:any)=>Promise<any>;review:(input:any)=>Promise<any>;knowledge:any;strategy:any;current?:any[];rejected?:string[];language?:string}):Promise<any>;
