import {validateStrategy} from './intelligence.mjs';
import {knowledgeSources} from './knowledge.mjs';
import {isStudioOutputError} from './structuredGeneration.mjs';

export function strategyEvidenceRecords(knowledge){
 const sources=knowledgeSources(knowledge);
 return knowledge.entities.map(entity=>({entityId:entity.id,kind:entity.kind,evidenceIds:entity.claimIds.filter(id=>Object.hasOwn(sources,id))}));
}
export function sourceStrategy(knowledge,vacancy=''){
 return validateStrategy({narrative:'Retain the candidate’s reported professional history, projects and credentials. Review the priorities for this application before approving.',priorities:strategyEvidenceRecords(knowledge).filter(e=>e.evidenceIds.length).map(e=>({entityId:e.entityId,evidenceIds:e.evidenceIds,treatment:'retain',reason:'Original evidence retained; no unverified AI priority applied.',pageOne:false})),employerObjectives:[],sectionOrder:['Professional Summary','Experience','Projects','Skills','Education','Certifications','Languages'],questions:[],newFacts:[],warnings:['AI strategy could not be verified after one automatic repair. This conservative strategy retains all original evidence and makes no employer-objective claims. Review it before approval, or regenerate for tailored priorities.']},knowledge,vacancy);
}
// Keep the same strict validator used when approving/generating. Repair the
// model's response instead of relaxing source ownership or vacancy grounding.
export async function generateVerifiedStrategy({generate,knowledge,vacancy='',feedback=''}){
 let repair=null;
 for(let attempt=0;attempt<2;attempt++){
  let value;
  try{value=await generate(repair);}catch(error){
   if(!isStudioOutputError(error))throw error;
   if(attempt===1)return sourceStrategy(knowledge,vacancy);
   repair={instruction:'Return one complete valid strategy object following the required schema.',issue:'Invalid structured output'};continue;
  }
  try{return validateStrategy(value,knowledge,vacancy,feedback);}catch(error){
   if(attempt===1)return sourceStrategy(knowledge,vacancy);
   repair={instruction:'Correct the strategy response. Each priority must use only evidence IDs owned by its exact entityId in strategyEvidenceRecords. Split synthesis into separate entity priorities. Never transfer evidence between employment, education or project records. Explicit employer objectives must cite a short exact substring from the original vacancy text, with unchanged punctuation and whitespace; otherwise label the objective as interpretation and leave vacancyQuote empty. Do not invent missing facts, identifiers or quotations. Preserve all credentials and employment chronology.',issue:String(error.message).slice(0,700)};
  }
 }
}
