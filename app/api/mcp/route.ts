import { handleMcp } from '../../../lib/data-api/mcp.ts';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(request:Request){return handleMcp(request);}
export const GET=POST;
export const DELETE=POST;
export const PUT=POST;
export const PATCH=POST;
export const OPTIONS=POST;
export const HEAD=POST;
