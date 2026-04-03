# /deploy

Deploy aceengineer-website changes through the normal Vercel workflow.

## Suggested workflow
1. Confirm branch status and changed files
2. Run targeted validation:

```bash
uv run pytest tests/python/ -q
```

3. Confirm static pages/assets look correct locally
4. Commit and push to `main`
5. Verify Vercel deploy status and spot-check key public URLs

## Focus areas
- homepage and service pages
- blog/case-study navigation
- calculators and linked JS assets
- sitemap.xml / robots.txt if routing changed
