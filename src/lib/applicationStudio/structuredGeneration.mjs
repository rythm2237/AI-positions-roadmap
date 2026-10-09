import {generateText,Output,NoObjectGeneratedError,NoOutputGeneratedError} from 'ai';

export class StudioOutputError extends Error {constructor(){super('AI could not complete a valid structured response. Your document is unchanged.');this.name='StudioOutputError';}}
export function isStudioOutputError(error){return error instanceof StudioOutputError||NoObjectGeneratedError.isInstance(error)||NoOutputGeneratedError.isInstance(error);}
// One bounded repair only for malformed/schema-invalid output. Authentication,
// budgets and rate limits retain their existing classified error handling.
export async function generateStudioObject({settings,model,schema,fallbackModel,retryInvalid=true,onInferenceComplete=()=>{}},generate=generateText){
 let activeModel=model,repair=false,accessFallback=false;
 for(;;){
  try{
   const result=await generate({...settings,model:activeModel,output:Output.object({schema}),...(repair?{system:settings.system+' Return one complete JSON object conforming to the response schema. No markdown or commentary. Include every required field; use empty arrays for absent collections.'}:{})});
   onInferenceComplete();
   if(result.finishReason==='length')throw new StudioOutputError();
   const output=result.output;
   if(!schema.safeParse(output).success)throw new StudioOutputError();
   return {...result,output};
  }catch(error){
   if(isStudioOutputError(error)){
    onInferenceComplete();
    if(retryInvalid&&!repair&&!settings.abortSignal?.aborted){repair=true;continue;}
    throw new StudioOutputError();
   }
   const fallback=!accessFallback&&fallbackModel?.(error,activeModel);
   if(fallback&&!settings.abortSignal?.aborted){activeModel=fallback;accessFallback=true;continue;}
   throw error;
  }
 }
}
