import taxonomyData from "../../../content/intelligence/occupation-taxonomy.json";
export type OccupationTaxonomyEntry = typeof taxonomyData[number];
const normalize=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
export function getOccupationTaxonomy(careerId:string){return taxonomyData.find((entry)=>entry.careerId===careerId)??null;}
export function titleMatchesCareer(title:string,careerId:string){const entry=getOccupationTaxonomy(careerId);if(!entry)return false;const candidate=normalize(title);if(entry.excludedTitles.some((item)=>normalize(item)===candidate))return false;return [entry.canonicalTitle,...entry.alternativeTitles,...entry.seniorityVariants].some((item)=>normalize(item)===candidate);}
