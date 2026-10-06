import { generateText, gateway } from "ai";
import { NextResponse } from "next/server";
let ran = false;
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(request: Request) {
  if (process.env.VERCEL_ENV !== "preview" || Date.now() > 1791256318898 || new URL(request.url).searchParams.get("nonce") !== "probe-1791255418898-0qbqwsjb2wfn" || ran) return new Response("Not found", {status:404});
  ran = true;
  const checks: Record<string, unknown> = {};
  try { const credits = await gateway.getCredits(); checks.credits = credits; }
  catch(error) { checks.credits = {name:(error as Error).name,message:(error as Error).message,status:(error as {statusCode?:number}).statusCode}; }
  for (const model of ["openai/gpt-5.4-mini", "openai/gpt-4.1-mini"]) {
    try { const result = await generateText({model, prompt:'Return only the word OK.',maxOutputTokens:16,maxRetries:0,abortSignal:AbortSignal.timeout(15000)}); checks[model] = {ok:true,text:result.text}; }
    catch(error) { checks[model] = {name:(error as Error).name,message:(error as Error).message,status:(error as {statusCode?:number}).statusCode}; }
  }
  return NextResponse.json(checks,{headers:{"Cache-Control":"no-store"}});
}
