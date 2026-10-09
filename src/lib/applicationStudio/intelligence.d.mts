import type {Knowledge} from './knowledge.mjs';
export const STRATEGY_SCHEMA:string;
export const GENERATION_SCHEMA:string;
export function validateStrategy(value:any,kb:Knowledge,vacancy?:string,feedback?:string):any;
export function groundingIssues(text:string,evidence:string[]):string[];
export function validateGeneratedCV(value:any,kb:Knowledge,strategy:any,current?:any[],rejected?:string[]):any;
export function assessmentDimensions(analysis:any,kb:Knowledge,cv:any[],ats?:number):any;
