# Hardware directory cards

Updated all six hardware directories to use a shared image-led variant of the approved app card. Cards keep a 200px contained product image, one vendor/model heading, and icon-led fact rows. Grouped records without a real model keep their product name. Full names and source details remain in the existing drawer.

Removed card subtitles, repeated identity text, and separate compatibility boxes. Missing or failed images show an explicit placeholder. Product data, affiliate links, filters, and publication state were not changed.

The shared design rules and six page briefs and ownership manifests were updated.

## Verification

- Seven hardware browser tests passed: all six directories and an image-failure case. Checks cover 320–1600px widths, three desktop columns, overflow, themes, and mouse and keyboard drawer controls.
- Desktop screenshots for all six directories and representative mobile screenshots were inspected. Some source records have no product image; these retain the explicit fallback.
- The two existing app-card browser tests passed after extracting the shared fact rows.
- Seven focused card unit tests passed. TypeScript and static policy passed; static policy checked 290 routes.
- The full quality command stopped at unit tests: 134 test files passed and four failed in existing CLI image, Amazon review, hardware source-contract, and hardware image-readiness checks. Later SEO and build stages did not run in that command.
- Browser startup reported Google Fonts download failures and used fallback fonts, so those screenshots do not verify the final downloaded typography.

No production deployment was performed.
