# /check

Run a fast website validation pass for aceengineer-website.

## Suggested workflow
1. Inspect changed files
2. Run relevant Python tests:

```bash
uv run pytest tests/python/ -q
```

3. If frontend JS changed, run any available JS test/lint command from package.json
4. Open the affected pages locally or verify generated HTML structure
5. Summarize deploy risk, SEO impact, and any missing follow-up checks
