import assert from "node:assert/strict";
import {emptyKnowledge,stableId,knowledgeSources} from "../src/lib/applicationStudio/knowledge.mjs";
import {repairCandidates,validateRepairProposals,applyRepair} from "../src/lib/identity/profileReconstruction.mjs";
import {sensitiveClaimIds,isSensitiveCareerText} from "../src/lib/identity/careerPrivacy.mjs";
const kb=emptyKnowledge();
kb.sources.push({id:"src-demo",type:"cv",label:"Synthetic test CV"});
for(const [id,kind,label] of [
 ["person","header","A Sample"],["work","experience","Example Agency"],
 ["skills","skills","Automation Process Improvement"],["edu","education","Sample University"]
])kb.entities.push({id,kind,label,fields:{},claimIds:[]});
const add=(id,entityId,text,verification="candidate-reported")=>{
 kb.claims.push({id,entityId,sourceId:"src-demo",sourceType:"cv",original:text,confirmed:true,retracted:false,verification});
 kb.entities.find(e=>e.id===entityId).claimIds.push(id);
};
add("h1","person","A Sample");
add("h2","person","Gizella ut 35");
add("h3","person","1072 Budapest");
add("h4","person","Hungary");
add("h5","person","Bank neve: OTP Bank");
add("h6","person","Bankszámlaszám: 11111111-22222222-33333333");
add("h7","person","My verified LinkedIn URL","candidate-confirmed");
add("w1","work","Example Agency");
add("w2","work","Digital Marketing Specialist");
add("w3","work","January 2021 - June 2023");
add("w4","work","Prepared marketing presentations");
add("w5","work","Prepared marketing presentations");
add("w6","work","Assistant Manager, 2009 - 2012");
add("w7","work","Developed AI agent, measured 42% improvement","candidate-confirmed");
add("s1","skills","Process Improvement Projects Operational Planning Analytical Skills");
add("s2","skills","Process Improvement");
add("s3","skills","Projects Operational");
add("s4","skills","Planning");
add("e1","edu","Industrial Management institute");
add("e2","edu","Bachelor of Industrial Management");
const before=JSON.stringify(kb);
assert.equal(isSensitiveCareerText("Bank neve: OTP Bank","header"),true);
assert.equal(isSensitiveCareerText("Bankszámlaszám: 11111111-22222222-33333333","header"),true);
assert.equal(isSensitiveCareerText("Worked at OTP Bank as an analyst","experience"),false);
assert.deepEqual(sensitiveClaimIds(kb).sort(),["h5","h6"]);
const headers=repairCandidates(kb,"header");
assert.deepEqual(headers.candidates.map(x=>x.id),["h1","h2","h3","h4"]);
assert.equal(headers.skipped.sensitive,2);
assert.equal(headers.skipped.manual,1);
const jobs=repairCandidates(kb,"experience");
assert.equal(jobs.candidates.length,6);
assert.equal(jobs.skipped.manual,1);
const proposal={kind:"experience",label:"Digital Marketing Specialist — Example Agency",
 text:"Digital Marketing Specialist, Example Agency, January 2021 - June 2023. Prepared marketing presentations",
 sourceClaimIds:["w1","w2","w3","w4","w5"]};
assert.equal(validateRepairProposals(kb,"experience",[proposal],jobs.candidates.map(x=>x.id)).length,1);
assert.throws(()=>validateRepairProposals(kb,"experience",[{...proposal,text:proposal.text+" improved by 95%"}],jobs.candidates.map(x=>x.id)),/unsupported dates or numeric/);
assert.throws(()=>validateRepairProposals(kb,"experience",[{...proposal,sourceClaimIds:["w7"]}],jobs.candidates.map(x=>x.id)),/Source evidence changed/);
assert.throws(()=>validateRepairProposals(kb,"header",[{kind:"header",label:"Bank account",text:"Bankszámlaszám: 12345678",sourceClaimIds:["h5"]}],headers.candidates.map(x=>x.id)),/Sensitive personal information/);
const updated=applyRepair(kb,"experience",[proposal],jobs.candidates.map(x=>x.id));
assert.equal(JSON.stringify(kb),before,"Preview and apply never mutate the input knowledge object");
assert.equal(updated.revision,kb.revision+1);
assert.ok(updated.claims.find(c=>c.id==="w1").retracted);
assert.ok(updated.claims.find(c=>c.id==="w2").retracted);
assert.ok(updated.claims.find(c=>c.id==="w5").retracted);
assert.equal(updated.claims.find(c=>c.id==="w6").retracted,false,"Unselected older role survives");
assert.equal(updated.claims.find(c=>c.id==="w7").retracted,false,"Explicit user-confirmed result survives");
assert.ok(updated.claims.some(c=>c.original===proposal.text&&c.sourceClaimIds.length===5&&!c.retracted));
assert.equal(updated.claims.length,kb.claims.length+1,"History is additive; old facts remain recoverable.");
assert.ok(!Object.values(knowledgeSources(updated)).some(x=>x.includes("Bankszámlaszám")));
assert.equal(sensitiveClaimIds(updated).length,2,"Sensitive source data remain private, never silently deleted");

assert.deepEqual(repairCandidates(updated,"experience").candidates.map(c=>c.id),["w6"],"Already repaired work history is not offered for repair again");
const skillSources=repairCandidates(kb,"skills");
const skills=[
 {kind:"skills",label:"Process Improvement",text:"Process Improvement",sourceClaimIds:["s1","s2"]},
 {kind:"skills",label:"Operational Planning",text:"Operational Planning",sourceClaimIds:["s1","s4"]},
];
assert.equal(validateRepairProposals(kb,"skills",skills,skillSources.candidates.map(c=>c.id)).length,2,"Compound source can support two separate real skills");
const split=applyRepair(kb,"skills",skills,skillSources.candidates.map(c=>c.id));
assert.ok(split.claims.some(c=>c.original==="Process Improvement"&&!c.retracted));
assert.ok(split.claims.some(c=>c.original==="Operational Planning"&&!c.retracted));
assert.ok(split.claims.find(c=>c.id==="s1").retracted,"Compound legacy skill retired after approved split");
assert.equal(repairCandidates(split,"skills").candidates.some(c=>c.id==="s1"),false,"Processed skill never re-enters repair queue");

console.log("Career reconstruction PASS: bank-data quarantine, source validation, grouped experience, provenance, manual preservation, explicit rollback history, and no mutation.");
