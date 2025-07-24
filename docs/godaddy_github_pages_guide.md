# How to Point GoDaddy Domain to GitHub Pages

This guide shows how to point your GoDaddy domain to your GitHub Pages site: `https://vamseeachanta.github.io/aceengineer-website/`

## Method 1: Using CNAME (Recommended)

### Step 1: Configure GitHub Pages
1. Go to your repository settings: `https://github.com/samdansk2/aceengineer_website/settings/pages`
2. Under "Custom domain", enter your domain (e.g., `yourdomain.com`)
3. Check "Enforce HTTPS" (recommended)
4. GitHub will create a CNAME file in your repository

### Step 2: Configure GoDaddy DNS
1. Log into GoDaddy DNS Management
2. Delete any existing A records for your domain
3. Add these records:

```
Type: CNAME
Name: www
Value: vamseeachanta.github.io
TTL: 1 Hour

Type: A
Name: @
Value: 185.199.108.153
TTL: 1 Hour

Type: A
Name: @
Value: 185.199.109.153
TTL: 1 Hour

Type: A
Name: @
Value: 185.199.110.153
TTL: 1 Hour

Type: A
Name: @
Value: 185.199.111.153
TTL: 1 Hour
```

## Method 2: Subdomain Only (Simpler)

If you want to use a subdomain like `www.yourdomain.com`:

### GoDaddy DNS:
```
Type: CNAME
Name: www
Value: samdansk2.github.io
TTL: 1 Hour
```

### GitHub Pages:
- Custom domain: `www.yourdomain.com`

## Important Notes

- DNS changes take 24-48 hours to propagate
- The `/aceengineer_website/` path will be removed once custom domain is set up
- Make sure your repository is public for GitHub Pages to work
- Enable HTTPS in GitHub Pages settings after DNS propagates

## Verification

After 24-48 hours, test:
- `yourdomain.com` → should redirect to your site
- `www.yourdomain.com` → should show your site
- HTTPS should work automatically

## Troubleshooting

If your domain doesn't work after 48 hours:
1. Check DNS propagation: Use `dig yourdomain.com` or online DNS checkers
2. Verify GitHub Pages is enabled and custom domain is set
3. Check that your repository is public
4. Ensure CNAME file exists in your repository root

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GoDaddy DNS Management](https://www.godaddy.com/help/manage-dns-680)
- [DNS Propagation Checker](https://www.whatsmydns.net/)