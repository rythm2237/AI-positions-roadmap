import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { processNextRefreshItem } from "@/lib/intelligence/adminRefreshQueue";
export async function POST(_request:Request,{params}:{params:Promise<{runId:string}>}){const auth=await requireAdmin();if(auth.status!=="admin")return NextResponse.json({error:auth.status==="unauthenticated"?"SESSION_EXPIRED":"FORBIDDEN"},{status:auth.status==="unauthenticated"?401:403});const{runId}=await params;if(!/^[0-9a-f-]{36}$/i.test(runId))return NextResponse.json({error:"INVALID_RUN"},{status:422});try{return NextResponse.json(await processNextRefreshItem(runId))}catch{return NextResponse.json({error:"RUN_PROCESSING_FAILED"},{status:503})}}
