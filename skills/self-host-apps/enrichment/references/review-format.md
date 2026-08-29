# Candidate review format

Use one record per claimed candidate:

```json
{
  "records": [
    {
      "candidate_id": "candidate-uuid",
      "decision": "publish",
      "app": {
        "slug": "example",
        "name": "Example",
        "summary": "Direct sentence explaining what the app helps a user do.",
        "icon_url": "/app-icons/example.png",
        "website_url": "https://example.org",
        "source_code_url": "https://github.com/example/example",
        "source_code_host": "github",
        "install_docs_url": "https://example.org/docs/install",
        "license": "MIT",
        "license_type": "permissive",
        "license_spdx_id": "MIT",
        "source_model": "open_source",
        "published": true,
        "self_hosting_status": "self_hostable",
        "publisher_type": "unknown",
        "maintenance_status": "active",
        "docker_support": "unknown",
        "compose_support": null,
        "requires_database": null,
        "database_types": [],
        "ram_min_mb": null,
        "ram_recommended_mb": null,
        "storage_min_gb": null,
        "resource_requirement_kind": "unknown",
        "storage_profile": "unknown",
        "pricing_model": "unknown",
        "deployment_methods": [],
        "surfaces": [],
        "categories": ["developer-tools"],
        "summary_source": "curated",
        "summary_confidence": "high"
      },
      "field_sources": [
        {
          "field_name": "summary",
          "source": "stack127_curated",
          "source_url": "https://example.org",
          "confidence": "high",
          "note": "Written from the verified product purpose."
        },
        {
          "field_name": "categories",
          "source": "stack127_curated",
          "source_url": "https://example.org",
          "confidence": "high"
        }
      ]
    }
  ]
}
```

Add one field-source entry for every populated link, classification, license, icon, source metadata value, and known technical fact. Empty arrays, `null`, and `unknown` do not need invented evidence.

For a confirmed name match, set `app_id` to the existing app UUID. For `duplicate`, `reject`, or `needs_review`, omit `app` and include the required app ID or reason.
