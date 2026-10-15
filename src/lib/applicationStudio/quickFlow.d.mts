export const QUICK_POLICY:string;
export const QUICK_QUESTIONS_POLICY:string;
export const quickQuestionsSchema:import('zod').ZodType;
export function quickKnowledge(context:any):any;
export function quickStrategy(kb:any,context:any):any;
export function quickQuestions(value:unknown,kb:any):any;
export function quickReport(analysis:any):any;
export function preserveQuickSections(generated:any[],original:any[]):any[];
