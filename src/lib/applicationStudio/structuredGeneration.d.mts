import type {generateText} from 'ai';
import type {ZodType} from 'zod';
export class StudioOutputError extends Error {}
export function isStudioOutputError(error:unknown):boolean;
export function generateStudioObject(options:{settings:{system:string;prompt:string;maxOutputTokens:number;abortSignal:AbortSignal};model:string;schema:ZodType;fallbackModel?:(error:unknown,model:string)=>string|undefined;retryInvalid?:boolean;onInferenceComplete?:()=>void},generate?:typeof generateText):Promise<{output:unknown;finishReason:string}>;
