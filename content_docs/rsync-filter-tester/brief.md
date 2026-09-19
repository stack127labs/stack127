Status: ready
Tool: Rsync filter tester
Route: /rsync-filter-tester

## Who is here

People writing `.rsync-filter` files, backup scripts, and deployment excludes. They know the files they want to copy but need to see how ordered include and exclude rules affect every path before a sync runs.

## The job

Paste filter rules and a representative file tree. The tool evaluates each path in order, reports the first matching rule, and calls out excluded parents that make descendants unreachable. It should answer “will this path be sent?” without connecting to a host.

## Show vs say

Show a path table with included, excluded, and unvisited states plus the matching rule. Show the ordered rules beside the result. Say that matching is a local model of rsync filter syntax and that a real command, transfer root, and version can still change behavior.
