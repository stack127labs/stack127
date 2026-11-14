import { ApiError, sqlEnabled } from './config.ts';
import { authorize, checkSqlAccess, errorResponse, privateHeaders, readJson, usage } from './http.ts';
import { executeTool } from './ad-networks/core.ts';
import { toolNames } from './ad-networks/schemas.ts';
import type { ToolName } from './ad-networks/schemas.ts';
export async function handleRest(request: Request,tool: string): Promise<Response> {
  try {
    if(tool==='run_readonly_sql' && !sqlEnabled())throw new ApiError(404,'not_found','Not found.');
    if(!toolNames.includes(tool as ToolName))throw new ApiError(404,'not_found','Not found.');
    const principal=await authorize(request,'rest');
    if(request.method!=='POST')return new Response(null,{status:405,headers:{...privateHeaders,Allow:'POST'}});
    const name=tool as ToolName,start=Date.now();
    try {
      checkSqlAccess(name,principal);
      const result=await executeTool(name,await readJson(request));
      usage(principal,name,start,result.limits.row_count,'ok');
      return Response.json(result,{headers:privateHeaders});
    } catch(error){usage(principal,name,start,0,error instanceof ApiError?error.code:'unavailable');throw error;}
  } catch(error){return errorResponse(error);}
}
