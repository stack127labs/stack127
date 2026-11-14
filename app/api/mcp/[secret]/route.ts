import { handleMcp } from '../../../../lib/data-api/mcp.ts';
export const runtime='nodejs';
export const dynamic='force-dynamic';
type Context={params:Promise<{secret:string}>};
export async function POST(request:Request,context:Context){return handleMcp(request,(await context.params).secret);}
export const GET=POST;
export const DELETE=POST;
export const PUT=POST;
export const PATCH=POST;
export const OPTIONS=POST;
export const HEAD=POST;
