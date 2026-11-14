import { notFoundResponse } from '../../../lib/data-api/http.ts';

// Unknown API paths and invalid MCP capability paths have one response shape.
export const runtime='nodejs';
export const dynamic='force-dynamic';
export function GET(){return notFoundResponse();}
export const POST=GET;
export const DELETE=GET;
export const PUT=GET;
export const PATCH=GET;
export const OPTIONS=GET;
export const HEAD=GET;
