# Brief: Rebuild Window and Read-Error Exposure Calculator

## Current supporting-content direction

Approved September 6, 2026. Explain the aggregate source-read rate and representative scope, use the existing two-drive mirror fixture as a worked time example, then separate read-error exposure from data-loss probability.

The working tool stays first. Use connected explanation at the depth the task needs, with no word, section, sentence, or visual-ratio quota. This direction supersedes earlier supporting-prose budgets in this page's planning artifacts; it does not change the engine or input contract. Store live copy only in the development tool-page row through the reviewed content command. Publication remains a separate operation.

## Who is here

A homelab builder or NAS operator is sizing an array or looking at a degraded array before a rebuild starts. They know the RAID level, drive size, and a rough effective rebuild speed, but they want one auditable answer instead of a broad reliability model.

## The job

Leave with the modeled total degraded window, the rebuild copy time, the source bytes read, and the probability of at least one specified read error under clear assumptions. The page must make the model's limits obvious without turning the result into a data-loss guarantee.

## Show vs say

The calculator is the main visual: one full-width workbench containing the form and result. Show the degraded window first, then a segmented delay-versus-copy visual, exact read bytes, source-drive equivalents, and a labeled read-error exposure bar. Use a compact details table for normalized inputs and formula values. Say only what the model means, why the RAID 6 read count is a minimum reconstruction model, and what the result does not prove. No marker art, screenshots, broad RAID comparison, or FAQ is needed at launch.
