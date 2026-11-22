import { authenticate } from './auth.ts';
import type { Principal } from './auth.ts';
import { ApiError, enabled, sqlEnabled } from './config.ts';
import { consumeRateLimit } from './database.ts';
import { privateHeaders, notFoundResponse } from './private-response.mjs';
export { privateHeaders, notFoundResponse };
export function errorResponse(error: unknown) {
  const e=error instanceof ApiError?error:new ApiError(503,'unavailable','Data service unavailable.');
  if (e.status===404) return notFoundResponse();
  return Response.json({error:{code:e.code,message:e.message}},{status:e.status,headers:{...privateHeaders,...(e.status===429?{'Retry-After':'60'}:{})}});
}
export async function authorize(request: Request,front: 'mcp'|'rest',secret?: string): Promise<Principal> {
  if(!enabled(front==='mcp'?'STACK127_MCP_ENABLED':'STACK127_REST_ENABLED'))throw new ApiError(404,'disabled','Not found.');
  const principal=await authenticate(request,front==='mcp'?secret:undefined);
  const origin=request.headers.get('origin');
  const allowed=(process.env.STACK127_DATA_ALLOWED_ORIGINS||'https://stack127.com,https://chatgpt.com,https://claude.ai').split(',');
  if(origin && !allowed.includes(origin))throw new ApiError(403,'origin','Origin not allowed.');
  await consumeRateLimit(principal);
  return principal;
}
export async function readJson(request: Request) {
  const reader=request.body?.getReader();
  if(!reader)throw new ApiError(400,'invalid_json','JSON body required.');
  const chunks:Uint8Array[]=[];let size=0;
  try {
    for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;
      if(size>65536){await reader.cancel();throw new ApiError(413,'body_too_large','JSON body exceeds 64 KB.');}chunks.push(value);}
    try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new ApiError(400,'invalid_json','Invalid JSON.');}
  } finally {reader.releaseLock();}
}
export function checkSqlAccess(tool: string,principal: Principal) {
  if(tool==='run_readonly_sql' && (!sqlEnabled()||!principal.allowSql||principal.plan!=='private'))throw new ApiError(404,'disabled','SQL tool disabled.');
}
export function usage(principal: Principal,tool: string,start: number,rowCount: number,status: string) {
  // Existing structured app logging. Never log bodies, URLs, headers, SQL, or errors.
  console.info(JSON.stringify({event:'data_api_usage',principal:principal.id,tool,duration_ms:Date.now()-start,row_count:rowCount,status}));
}
