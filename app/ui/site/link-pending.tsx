"use client";

import { useLinkStatus } from "next/link";

export function LinkPending() {
  const { pending } = useLinkStatus();
  return pending ? <span className="site-link-pending" role="status">Opening page…</span> : null;
}
