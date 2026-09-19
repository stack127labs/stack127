Status: ready
Tool: Home Assistant MQTT discovery checker
Route: /mqtt-discovery-checker

## Who is here

Home Assistant users and integration authors troubleshooting MQTT discovery payloads. They have a topic and JSON from a broker and need a fast answer about schema, naming, device metadata, and likely discovery failures.

## The job

Paste a discovery topic and payload. The checker validates the component topic, parses JSON, checks common required fields and relationships, and gives actionable findings with paths. It must separate definite schema errors from warnings that depend on the entity platform.

## Show vs say

Show one validity lead, a finding list, and a normalized payload preview. Show the topic segments that were recognized. Say that Home Assistant versions and component schemas evolve; this checker validates a documented subset and does not connect to a broker.
