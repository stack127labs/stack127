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
      "install_options": [
        {
          "method": "docker",
          "label": "Docker image",
          "url": "https://hub.docker.com/r/example/app",
          "image": "example/app:latest",
          "support_level": "official",
          "source_url": "https://example.org/docs/install",
          "note": null,
          "sort_order": 10
        }
      ],
      "sources": [
        {
          "source": "official_product_site",
          "source_url": "https://example.org",
          "confidence": "high",
          "note": "Used to verify the product purpose and self-hosted installation."
        }
      ],
      "data_source_urls": ["https://example.org"],
      "data_confidence": "high"
    }
  ]
}
```

Add the URLs that support the review to `sources` and `data_source_urls`. If an official source was checked but did not publish a technical value, keep the value `null` or `unknown` and record that outcome in `technical_fact_status` with `status: "not_published"`. Do not invent a number or create a field-level provenance record.

For a confirmed name match, set `app_id` to the existing app UUID. For `duplicate`, `reject`, or `needs_review`, omit `app` and include the required app ID or reason.
