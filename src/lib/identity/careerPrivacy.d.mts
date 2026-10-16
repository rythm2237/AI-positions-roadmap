export function isSensitiveCareerText(value:unknown,kind?:string):boolean;
export function isSensitiveCareerClaim(claim:{original?:string}|null|undefined,entity:{kind?:string;label?:string}|null|undefined):boolean;
export function sensitiveClaimIds(knowledge:any):string[];
