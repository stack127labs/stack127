# Brief: Home Assistant Energy Entity Eligibility Checker

## Who is here

A Home Assistant user has an entity that is missing from one Energy dashboard picker. They can copy its current state attributes, but they should not need to know the picker rules or recorder internals first.

## The job

They leave with two bounded answers: whether the supplied attributes match the intended Energy field, and whether they match the long-term-statistics attribute contract. They also see every failed field and the live-instance checks still required.

## Show vs say

- Show the intended roles as visible choices, not a hidden category picker.
- Show the Energy and statistics conclusions side by side on wide screens and stacked on narrow screens.
- Show the exact received-versus-accepted rule trace as a table that becomes labelled rows on narrow screens.
- Use one compact supporting table for repeated role requirements.
- Use short sentences only for counter behavior, the instance-only boundary, local input handling, and the real verification step.
- Do not add marker art, a clean chart, a screenshot, an FAQ, a methodology essay, or generic YAML examples. The live checker and exact rule trace are the useful visuals.
