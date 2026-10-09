export const LETTER_REVIEW_SCHEMA:string;
export class LetterEvidenceError extends Error {issues:{id:string;reason:string}[];constructor(issues:{id:string;reason:string}[]);}
export function letterReviewInput(value:any,sources:Record<string,string>,context:Record<string,unknown>):any;
export function validateLetterReview(value:any,input:any):true;
export function generateGroundedLetter(options:{generate:(repair:any)=>Promise<any>;review:(input:any)=>Promise<any>;sources:Record<string,string>;context:Record<string,unknown>}):Promise<any>;
