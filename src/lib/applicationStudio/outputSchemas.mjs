import {z} from 'zod';

const strings=z.array(z.string());
const evidenceIds=strings;
const questions=strings;
const letter=z.object({paragraphs:z.array(z.object({text:z.string(),evidenceIds})),confirmationQuestions:questions});
const schemas={
 structure:z.object({sections:z.array(z.object({title:z.string(),items:z.array(z.object({sourceIds:strings,kind:z.enum(['heading','body','bullet','gap'])}))})),warnings:strings}),
 strategy:z.object({narrative:z.string(),employerObjectives:z.array(z.object({text:z.string(),basis:z.enum(['explicit','interpretation']),vacancyQuote:z.string()})),priorities:z.array(z.object({entityId:z.string(),evidenceIds,treatment:z.enum(['feature','summarize','retain','omit']),reason:z.string(),pageOne:z.boolean()})),sectionOrder:strings,questions:z.array(z.object({id:z.string(),question:z.string(),entityId:z.string(),field:z.string(),requirement:z.string(),importance:z.enum(['critical','useful'])})),newFacts:z.array(z.object({text:z.string(),entityId:z.string(),field:z.string()})),warnings:strings}),
 generate:z.object({sections:z.array(z.object({title:z.string(),displayTitle:z.string(),items:z.array(z.object({text:z.string(),evidenceIds,kind:z.enum(['heading','body','bullet']),entityId:z.string()}))})),warnings:strings}),
 analysis:z.object({job:z.object({company:z.string(),title:z.string(),location:z.string(),employmentType:z.string(),seniority:z.string(),salary:z.string(),visa:z.string(),languages:z.string(),responsibilities:strings,education:strings,tools:strings}),matrix:z.array(z.object({requirement:z.string(),priority:z.enum(['Mandatory','Preferred','Nice to Have']),category:z.enum(['experience','technical','responsibilities','education','industry','tools','languages','softSkills','eligibility','seniority']),level:z.enum(['Strong Match','Partial Match','Transferable Skill','Missing','Unknown']),evidenceIds,explanation:z.string(),action:z.string(),vacancyQuote:z.string(),vacancySourceId:z.string(),screeningGate:z.boolean()})),gaps:z.array(z.object({requirement:z.string(),type:z.enum(['Critical Gap','Learnable Gap','Interview Gap','CV Visibility Gap']),why:z.string(),learn:z.string(),depth:z.string(),priority:z.string(),questions})),confirmationQuestions:questions,companySummary:z.string()}),
 changes:z.object({changes:z.array(z.object({sectionId:z.string(),original:z.string(),proposed:z.string(),reason:z.string(),evidenceIds})),confirmationQuestions:questions,reply:z.string()}),
 cover:letter,motivation:letter,
 interview:z.object({questions:z.array(z.object({category:z.enum(['Likely','Technical','Behavioral','Transferable','Gap','Salary','Relocation / Visa']),question:z.string(),framework:z.string(),evidenceIds})),readiness:z.string()}),
 optimise:z.object({rewrites:z.array(z.object({text:z.string(),evidenceIds}))}),
};
export function studioOutputSchema(action){if(!Object.hasOwn(schemas,action))throw Error('Unsupported structured AI action.');return schemas[action];}
