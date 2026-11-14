import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';
import { ApiError, MAX_ANSWER_BYTES, sqlEnabled } from './config.ts';
import { authorize, checkSqlAccess, errorResponse, privateHeaders, readJson, usage } from './http.ts';
import { executeTool } from './ad-networks/core.ts';
import { toolNames, toolSchemas } from './ad-networks/schemas.ts';
import type { ToolName } from './ad-networks/schemas.ts';
import { sqlSchema } from './ad-networks/sql.ts';
const descriptions: Record<ToolName,string> = {
  get_brand_kit:'For charts, images, tables and shared visuals: call once per visual task for stack127 colors, fonts, inline SVG logos and credit rules. Not needed for data questions. Input {}.',
  ad_networks_overview:'Start here before researching stack127 ad network data. Returns coverage totals, freshness, all definitions/caveats, allowed filters and a tool guide. Counts observed sites, not the whole market.',
  list_ad_networks:'Use to choose networks by joining rules or compare listed/managed counts and payment terms. Returns sourced public facts with checkedAt, median RDAP domain age and measurement bases. Traffic units and alternative joining rules are not comparable without reading the facts.',
  get_ad_network:'Use for a full profile of one network slug. Returns sourced joining/payment facts, confirmed/stale/listed/managed counts, age/year/niche/size/platform distributions, co-listed networks and bounded newest-first daily snapshots. Missing days are unknown; snapshots are listed counts.',
  compare_ad_networks:'Use for 2–6 networks side by side on one dimension. Returns distinct-site counts, per-network filtered bases, and percentage shares including unknown groups. A site may belong to several networks. Bounded rows; check truncated.',
  count_sites:'Use for flexible distinct-site counts with filters and up to two grouping dimensions. Networks are OR. Unfiltered totals deduplicate multi-network sites; network groups overlap. Returns explicit bases, shares and null/unknown groups. Bounded groups; check truncated.',
  find_sites:'Use for a bounded list of matching public domains and all their listed network memberships, types and confirmation times. Also returns niche/platform/RDAP date/CrUX size and next_cursor. At most 200 sites; reuse cursor with identical filters/sort. No publisher names.',
  lookup_site:'Use to inspect one bare domain. Returns current and past observed network relationships, confirmation/end times, public ads.txt summary, niche/platform/RDAP age/CrUX size and bounded newest-first events. No live crawl. A missing domain is unknown, not network-free.',
  network_movements:'Use to inspect observed joins, departures and newly found sites by network/day over at most 366 days. Strong warning: history starts around 2026-10-19 and checker faults repaired 2026-11-13/14 caused false departures. Not reliable churn/growth. Missing days are unknown. Baseline imports excluded.',
  run_readonly_sql:'Private only. Use when the other tools cannot express a read-only research query. Returns capped rows, metadata and truncation, using a dedicated restricted database login and 15s maximum statement timeout. Never a write tool. '+sqlSchema,
};
export function mcpAnswer(answer: Awaited<ReturnType<typeof executeTool>>) {
  // Text-only MCP clients must receive the same answer. Apply the byte budget
  // after pretty-printing as well; whitespace also consumes the response budget.
  const text=JSON.stringify(answer,null,2);
  if (Buffer.byteLength(text)>MAX_ANSWER_BYTES) throw new ApiError(413,'answer_too_large','Answer exceeds 1 MB. Narrow the query or lower the row limit.');
  return {structuredContent:answer,content:[{type:'text' as const,text}]};
}
export async function handleMcp(request: Request,secret?: string): Promise<Response> {
  let server:McpServer|undefined;
  try {
    const principal=await authorize(request,'mcp',secret);
    if(request.method!=='POST')return new Response(null,{status:405,headers:{...privateHeaders,Allow:'POST'}});
    const body=await readJson(request);
    // MCP batching is not accepted: each HTTP request has one rate-limit unit.
    if(!body||Array.isArray(body)||typeof body!=='object')throw new ApiError(400,'invalid_request','One JSON-RPC request per HTTP request.');
    server=new McpServer({name:'stack127-private-ad-networks',version:'1.0.0'},
      {instructions:'Start with ad_networks_overview. Cite the returned stack127 URL. Carry definitions, as_of, filters and caveats into research. Listed sites may overlap between networks. Movements are not reliable growth/churn. All tools read data; SQL is private and optional. When making a chart, image or table for sharing, call get_brand_kit first. Title the visual by what it shows and add "Source: stack127.com/ad-networks · data as of <as_of date>", using the data answer’s as_of date and its more specific page URL when available. Use the brand colors and dark theme by default.'});
    for(const name of toolNames.filter(n=>n!=='run_readonly_sql'||sqlEnabled())) {
      server.registerTool(name,{
        title:name.split('_').map(w=>w[0].toUpperCase()+w.slice(1)).join(' '),description:descriptions[name],
        inputSchema:toolSchemas[name],outputSchema:z.object({as_of:z.unknown(),queried_at:z.string(),definitions:z.record(z.string(),z.string()),caveats:z.array(z.string()),filters:z.record(z.string(),z.unknown()),url:z.string(),data:z.record(z.string(),z.unknown()),limits:z.object({max_rows:z.number(),row_count:z.number(),truncated:z.boolean(),truncated_sets:z.array(z.string())})}),
        annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false},
      },async (input: Record<string,unknown>)=>{
        const start=Date.now();
        try {
          checkSqlAccess(name,principal);
          const answer=await executeTool(name,input);
          const result=mcpAnswer(answer);
          usage(principal,name,start,answer.limits.row_count,'ok');
          return result;
        } catch(error) {
          const e=error instanceof ApiError?error:new ApiError(503,'unavailable','Data service unavailable.');
          usage(principal,name,start,0,e.code);
          return {isError:true,content:[{type:'text' as const,text:`${e.code}: ${e.message}`}]};
        }
      });
    }
    const transport=new WebStandardStreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});
    await server.connect(transport);
    const response=await transport.handleRequest(request,{parsedBody:body});
    // JSON mode has completed the tool call before returning; no SSE stream to retain.
    const bytes=await response.arrayBuffer();
    return new Response(bytes,{status:response.status,headers:{...Object.fromEntries(response.headers),...privateHeaders}});
  } catch(error){return errorResponse(error);} finally {
    // Cleanup must not escape the sanitized API error boundary.
    try {await server?.close();} catch { /* The request has already completed. */ }
  }
}
