# Brief: `.dockerignore` Pattern Tester

## Who is here

A developer has a `.dockerignore` file that excludes too much, still sends unwanted paths, or behaves differently from a generic glob tester. They know the rules and representative project paths, but they need Docker-specific answers without running a build or uploading a repository.

## The job

They paste one effective ignore file and a batch of context-relative paths, test once, and leave with an included or excluded verdict for every path, the final rule that decided it, and an ordered trace that distinguishes direct matches from inherited parent-match evidence.

## Show vs say

The full-width workbench remains the main visual: two editors lead to an answer sentence, exact included and excluded counts, and a responsive result table whose expandable rows show the ordered rule trace. Pattern diagnostics use a table because line number, source text, normalized form, and status repeat.

Supporting content answers the questions the interface cannot answer alone. A short introduction defines the result and boundary. Sentences explain which ignore file is effective, how to choose representative path probes, and how to troubleshoot a surprising verdict. One compact table explains useful Docker pattern forms, and one compact table separates matcher evidence from real build proof. The built-in example carries the worked example instead of adding another visual. There is no marker art, chart, screenshot, FAQ, generator advice, or article-length tutorial because those would compete with the live tool.
