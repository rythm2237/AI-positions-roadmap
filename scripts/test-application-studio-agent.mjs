import {build} from 'esbuild';
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const outfile='.studio-agent-test.mjs';
try {
 await build({entryPoints:['scripts/fixtures/application-studio-agent.ts'],bundle:true,platform:'node',format:'esm',packages:'external',outfile,tsconfig:'tsconfig.json',plugins:[{name:'server-only-test-marker',setup(b){b.onResolve({filter:/^server-only$/},()=>({path:'server-only',namespace:'test-marker'}));b.onLoad({filter:/.*/,namespace:'test-marker'},()=>({contents:'export {};',loader:'js'}));}}]});
 execFileSync(process.execPath,[outfile],{stdio:'inherit'});
}finally{await fs.rm(outfile,{force:true});}
