# Brief: NGINX proxy_pass URI Calculator

## Who is here

A developer or homelab operator has one NGINX location and one request that reaches the wrong backend path. They know the configuration syntax but do not want to reason through URI presence, prefix replacement, and query arguments in their head.

## The job

They leave with the exact upstream URL for a supported static prefix or exact location, a visible trace of what NGINX retained or replaced, or an honest unknown result that tells them why the answer needs a real NGINX check.

## Show vs say

The tool UI is the main visual. It shows the final upstream URL, an ordered field-and-value transformation trace, and a side-by-side exact slash comparison. A compact table after the finished tool may compare a few canonical configurations. Sentences are limited to the short introduction, meaningful input guidance, result interpretation, normalization and runtime limits, local-browser privacy, and the next `nginx -T` plus upstream-log verification step. No marker art, screenshot, chart, FAQ, or long method section is needed.
