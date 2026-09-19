Status: ready
Tool: Restic retention simulator
Route: /restic-retention-simulator

## Who is here

Homelab operators and small teams who use restic and need to predict which snapshots `forget` will retain before pruning. They can read a policy file but want a safe, local explanation of each kept and removed snapshot.

## The job

Paste snapshot JSON and choose retention rules. The tool groups snapshots, applies the documented bucket rules, and answers which snapshots survive. It should make dates, grouping, and rule reasons visible so a user can compare a policy change without touching a repository.

## Show vs say

Show the retained count, a kept or pruned timeline, and the rule reason beside every snapshot. Say that this is a simulator for supplied metadata; it does not open a repository or run `restic forget`. Keep the explanation short and link to the official retention documentation in supporting content.
