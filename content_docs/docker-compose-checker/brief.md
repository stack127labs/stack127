# Brief: Docker Compose checker

## Who is here

A homelab operator or developer has one Compose file copied from a project README, editor, or existing server. They want to know what will fail next, but do not want to upload a file or pretend a browser can run Docker.

## The job

They leave with line-anchored YAML and Compose-model findings, a compact normalized summary, and a clear list of what still needs the real `docker compose config` command, project files, environment, or runtime.

## Show vs say

The tool owns the first screen: one Compose editor, one optional interpolation-environment editor, one check action, and an answer-first result. Use a structured diagnostic table for repeated codes, severities, paths, locations, excerpts, and fixes. Use a compact summary table for services, resources, profiles, ports, dependencies, interpolation state, and completeness. Supporting content should explain the current Compose Specification, obsolete `version`, the difference between interpolation and service `env_file`, unresolved `include` and `extends`, and the Docker handoff in connected sentences. No marker art, chart, screenshot, graph, formatter, or security score is justified.
