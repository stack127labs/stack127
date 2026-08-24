# Brief: Rebuild Window and Read-Error Exposure Calculator

## Who is here

A homelab builder or NAS operator is sizing an array or looking at a degraded array before a rebuild starts. They know the RAID level, drive size, and a rough effective rebuild speed, but they want one auditable answer instead of a broad reliability model.

## The job

Leave with the modeled total degraded window, the rebuild copy time, the source bytes read, and the probability of at least one specified read error under clear assumptions. The page must make the model's limits obvious without turning the result into a data-loss guarantee.

## Show vs say

The calculator is the main visual: one framed form and result. Show the degraded window first, then a segmented delay-versus-copy visual, exact read bytes, source-drive equivalents, and a labeled read-error exposure bar. Use a compact details table for normalized inputs and formula values. Say only what the model means, why the RAID 6 read count is a minimum reconstruction model, and what the result does not prove. No marker art, screenshots, broad RAID comparison, or FAQ is needed at launch.
