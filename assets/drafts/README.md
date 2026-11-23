Share card draft for maintainer review: `share-card-draft.png` is 1200 × 630. The editable source is `share-card-draft.svg`, using the navy, teal and serif/sans type treatment from `assets/css/theme.css`.

Regenerate from the repository root:

```sh
uv run --with cairosvg python -c "import cairosvg; cairosvg.svg2png(url='assets/drafts/share-card-draft.svg', write_to='assets/drafts/share-card-draft.png', output_width=1200, output_height=630)"
```

This draft is not referenced by page metadata. Existing social-preview images stay in place pending maintainer review.
