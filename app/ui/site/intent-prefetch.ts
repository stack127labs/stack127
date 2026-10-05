/**
 * Spread on a shared navigation <Link>. It turns off Next's viewport prefetch,
 * which would fetch every visible sidebar and card link on load, and marks the
 * link for IntentPrefetch to prefetch on hover, keyboard focus, or touch.
 */
export const intentPrefetch = { prefetch: false, "data-prefetch": "intent" } as const;
