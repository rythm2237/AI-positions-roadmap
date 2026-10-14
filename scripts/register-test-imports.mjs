// Native Node TypeScript tests need the same @/ and extensionless resolution as tsconfig.
// Do not transpile or replace the module format: tests use native ESM and top-level await.
import { registerHooks } from 'node:module';
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const sourceRoot=new URL('../src/',import.meta.url);
registerHooks({resolve(specifier,context,nextResolve) {
  let url;
  if(specifier.startsWith('@/')) url=new URL(specifier.slice(2),sourceRoot);
  else if((specifier.startsWith('./')||specifier.startsWith('../'))&&context.parentURL) url=new URL(specifier,context.parentURL);
  if(url?.protocol==='file:') {
    const path=fileURLToPath(url);
    if(!specifier.startsWith('@/') && existsSync(path)) return nextResolve(specifier,context);
    for(const candidate of [path,`${path}.ts`,`${path}.js`,`${path}/index.ts`]) {
      if(existsSync(candidate) && statSync(candidate).isFile()) return nextResolve(candidate,context);
    }
  }
  return nextResolve(specifier,context);
}});
