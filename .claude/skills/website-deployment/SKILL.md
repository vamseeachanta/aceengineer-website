---
name: website-deployment
description: Deploy and verify the AceEngineer static website on Vercel, including local preview, static asset checks, and post-deploy verification.
version: 1.0.0
category: website
type: skill
---

# Website Deployment

## When to Use
- deploying aceengineer-website changes to production
- verifying Vercel deployment behavior
- checking static asset routing and generated pages

## Workflow
1. inspect changed HTML/CSS/JS/data files
2. run local preview if needed (`npx http-server` or equivalent)
3. run targeted tests in `tests/python/` and `tests/js/` when affected
4. push to `main` for Vercel deployment
5. verify the live site pages and key assets

## Validation
```bash
uv run pytest tests/python/ -q
```
