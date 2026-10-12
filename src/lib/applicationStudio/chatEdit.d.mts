export const CHAT_EDIT_SCHEMA:string;
export class ChatEditError extends Error{}
export function generateChatEdit(options:{generate:(repair:any)=>Promise<any>;review:(input:any)=>Promise<any>;context:any;sources:Record<string,string>}):Promise<any>;
