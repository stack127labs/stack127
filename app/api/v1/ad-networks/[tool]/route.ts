import { handleRest } from '../../../../../lib/data-api/rest.ts';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(request:Request,context:{params:Promise<{tool:string}>}){return handleRest(request,(await context.params).tool);}

export const GET=POST;
export const DELETE=POST;
export const PUT=POST;
export const PATCH=POST;
export const OPTIONS=POST;
export const HEAD=POST;
