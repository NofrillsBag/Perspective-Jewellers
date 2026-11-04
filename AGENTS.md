<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application rules
- Keep storefront content at the index route and define its own social metadata, so the first page is the full shopping experience.
- Load the Three.js panoramic viewer dynamically after hydration, so browser rendering remains outside the server import graph.
- Keep illustrative catalog and responsibility copy clearly marked as a concept; verified material and impact claims need supplied evidence.
- Define visual styles and Three.js material colors in the global semantic design tokens, so the storefront and viewer share a consistent palette.
- Share product descriptions and keyboard action mapping in a browser-safe accessibility module, so product images and the viewer expose consistent text and testable shortcuts.
