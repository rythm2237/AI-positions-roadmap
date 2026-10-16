import assert from "node:assert/strict";
import {semanticReview,containedQuote,groupSemanticRecords} from "../src/lib/identity/semanticCv.mjs";
import {emptyKnowledge,importSemanticKnowledge,importKnowledge} from "../src/lib/applicationStudio/knowledge.mjs";

const cv=[
 "Jane Sample",
 "Main Street 14",
 "1087 Budapest",
 "Hungary",
 "jane.sample@example.org",
 "",
 "Professional Experience",
 "Operations Planner - Example Group",
 "Mar 2023 – Present",
 "Built weekly warehouse capacity reports.",
 "",
 "Education",
 "Bachelor in Business Management, Central University, 2020",
 "",
 "Certificates",
 "Microsoft Power BI Data Analyst, 2025",
 "Google Analytics Certificate, 2023",
 "",
 "Skills",
 "Power BI, Excel, SQL",
 "",
 "Languages",
 "English C1; Hungarian A2",
].join("\n");
const candidates=[
 {kind:"header",label:"Address",text:"Main Street 14, 1087 Budapest, Hungary",sourceQuote:"Main Street 14\n1087 Budapest\nHungary",details:{location:"Main Street 14, 1087 Budapest, Hungary"}},
 {kind:"header",label:"Email",text:"jane.sample@example.org",sourceQuote:"jane.sample@example.org",details:{}},
 {kind:"experience",label:"Operations Planner — Example Group",text:"Operations Planner, Example Group. Mar 2023 – Present. Built weekly warehouse capacity reports.",sourceQuote:"Operations Planner - Example Group\nMar 2023 – Present\nBuilt weekly warehouse capacity reports.",details:{role:"Operations Planner",organisation:"Example Group",dates:"Mar 2023 – Present"}},
 {kind:"education",label:"Bachelor in Business Management",text:"Bachelor in Business Management, Central University, 2020",sourceQuote:"Bachelor in Business Management, Central University, 2020",details:{organisation:"Central University"}},
 {kind:"certifications",label:"Power BI Data Analyst",text:"Microsoft Power BI Data Analyst, 2025",sourceQuote:"Microsoft Power BI Data Analyst, 2025",details:{issuer:"Microsoft"}},
 {kind:"certifications",label:"Google Analytics Certificate",text:"Google Analytics Certificate, 2023",sourceQuote:"Google Analytics Certificate, 2023",details:{issuer:"Google"}},
 {kind:"skills",label:"Power BI",text:"Power BI",sourceQuote:"Power BI",details:{}},
 {kind:"skills",label:"Excel",text:"Excel",sourceQuote:"Excel",details:{}},
 {kind:"skills",label:"SQL",text:"SQL",sourceQuote:"SQL",details:{}},
 {kind:"languages",label:"English",text:"English C1",sourceQuote:"English C1",details:{level:"C1"}},
];
const reviewed=semanticReview(cv,candidates);
assert.equal(reviewed.rejected.length,0);
assert.equal(reviewed.records.length,candidates.length);
assert.equal(groupSemanticRecords(reviewed.records).header.length,2);
assert.equal(groupSemanticRecords(reviewed.records).certifications.length,2);
assert.ok(containedQuote(cv,"Main Street 14 1087 Budapest Hungary"));
assert.ok(!containedQuote(cv,"Fake Street 99 1087 Budapest"));
const wrong=semanticReview(cv,[{...candidates[0],text:"Main Street 14, 1087 Budapest, Hungary. Saved 90% costs."}]);
assert.equal(wrong.records.length,0,"Unproven percentage excluded");
const ungrounded=semanticReview(cv,[{...candidates[0],sourceQuote:"Some invented address"}]);
assert.equal(ungrounded.records.length,0,"Invented source excerpt excluded");
const old=importKnowledge(emptyKnowledge(),{text:"Skills\nProcess analysis",type:"cv",label:"Original CV"});
const kb=importSemanticKnowledge(old,{text:cv,type:"cv",label:"Updated CV",records:reviewed.records});
assert.ok(kb.claims.some(c=>c.original==="Process analysis"),"Preserve existing profile");
const addresses=kb.claims.filter(c=>c.original==="Main Street 14, 1087 Budapest, Hungary");
assert.equal(addresses.length,1,"All three address lines combined into ONE record");
assert.equal(addresses[0].sourceQuote,candidates[0].sourceQuote,"Proof remains original multi-line excerpt");
assert.equal(kb.entities.find(e=>e.id===addresses[0].entityId).metadata.address,"Main Street 14, 1087 Budapest, Hungary");
assert.equal(kb.entities.filter(e=>e.kind==="certifications"&&e.claimIds.length).length,2,"Separate certificates");
assert.equal(kb.entities.filter(e=>e.kind==="skills"&&e.claimIds.length).length,4,"Preserve legacy skill and create three distinct new skills");
const replay=importSemanticKnowledge(kb,{text:cv,type:"cv",label:"Updated CV",records:reviewed.records});
assert.equal(replay.revision,kb.revision,"Repeat import is idempotent");
const another=importSemanticKnowledge(kb,{text:"Certifications\nGoogle Analytics Certificate, 2023\nAdvanced SQL Certificate, 2026",type:"certification",label:"Second source",records:[
 {...candidates[5],sourceQuote:"Google Analytics Certificate, 2023"},
 {kind:"certifications",label:"Advanced SQL Certificate",text:"Advanced SQL Certificate, 2026",sourceQuote:"Advanced SQL Certificate, 2026",details:{}},
]});
assert.equal(another.claims.filter(c=>c.original==="Google Analytics Certificate, 2023").length,1,"Cross-file duplicates suppressed");
assert.equal(another.claims.filter(c=>c.original==="Advanced SQL Certificate, 2026").length,1);
console.log("Semantic Career Profile PASS: multi-line address as ONE record, role/education/certificates/skills, source grounding, duplicate merge and legacy preservation.");
