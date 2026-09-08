# Homepage corner art

Replaced the branching server diagram with two stacked app windows and a terminal prompt. The foreground window uses neutral ink, the rear outline stays muted, and the prompt supplies one chartreuse accent. No labels, connectors, or extra symbols were added.

The existing homepage spec and generated assets remain in `app/(site)/art/`. The new parametric `softwareStack` icon lives in the marker-art generator. Only the homepage asset was regenerated. The homepage brief records the current visual direction.

Homepage text now reserves space for the corner drawing from 1100px upward. The existing shared component still hides the drawing on smaller screens.

Standalone Playwright verified dark and light themes at 1600, 1280, 1100, and 390px. Desktop screenshots and actual-size drawing crops were inspected. The art stays outside the heading, contains no visible text, remains decorative for assistive technology, and introduces no horizontal overflow. The in-app Browser was unavailable.

The generator, homepage tests, entry-page tests, typecheck, and static policy passed. The complete quality gate still encounters pre-existing CLI icon-cache and hardware-directory asset/review failures. This change does not certify a production build or deployment.
