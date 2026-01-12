# Vercel Deployment Guide

This repository is configured for deployment on [Vercel](https://vercel.com).

## Prerequisites

1. A Vercel account.
2. This repository pushed to GitHub, GitLab, or Bitbucket.

## Deployment Steps

1. **Login to Vercel:**
   Go to your Vercel dashboard.

2. **Add New Project:**
   - Click "Add New..." -> "Project".
   - Import this repository (`aceengineer-website`).

3. **Configure Project:**
   - Framework Preset: `Other` (since this is a static site with potential Python backend components not yet configured for Serverless).
   - Root Directory: `./` (default).
   - Build Command: (Leave empty).
   - Output Directory: (Leave empty, Vercel will serve the root).

4. **Deploy:**
   Click "Deploy".

## Domain Configuration

The repository includes a `CNAME` file with `aceengineer.com`.
- After deployment, go to the project "Settings" -> "Domains" in Vercel.
- Add `aceengineer.com`.
- Vercel will provide DNS records (A record or CNAME) to configure in your domain registrar (e.g., GoDaddy, Namecheap).

## Note on Backend

This deployment configuration focuses on the **static website** (HTML/CSS/JS) located in the root directory.
The Flask application in `digitaltwinfeed/` is **not** automatically deployed as a serverless function with this configuration.
If you wish to deploy the Flask app to Vercel, additional configuration (converting to Vercel Functions) is required.
