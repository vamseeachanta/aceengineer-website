# DNS Configuration for aceengineer.com

> **Purpose:** Configure GoDaddy DNS records to point aceengineer.com to GitHub Pages
> **Last Updated:** 2026-01-09

## Overview

This document provides step-by-step instructions for configuring DNS records on GoDaddy to enable the aceengineer.com custom domain with GitHub Pages hosting.

## Prerequisites

- Domain registered with GoDaddy: aceengineer.com
- Access to GoDaddy DNS management console
- GitHub Pages repository configured and deployed
- CNAME file created in repository root with domain name

## DNS Configuration Steps

### Step 1: Access GoDaddy DNS Management

1. Log in to your GoDaddy account at https://www.godaddy.com
2. Navigate to **My Products** → **Domains**
3. Click the **DNS** button next to aceengineer.com
4. You'll see the DNS Management page with current records

### Step 2: Configure A Records for Apex Domain

GitHub Pages requires four A records pointing to their IP addresses.

**Add the following A records:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 185.199.108.153 | 600 seconds |
| A | @ | 185.199.109.153 | 600 seconds |
| A | @ | 185.199.110.153 | 600 seconds |
| A | @ | 185.199.111.153 | 600 seconds |

**Instructions:**
1. Click **Add** button
2. Select **Type:** A
3. Enter **Name:** @ (represents root domain)
4. Enter **Value:** 185.199.108.153
5. Set **TTL:** 600 seconds (or 1 hour)
6. Click **Save**
7. Repeat for the other three IP addresses

**Note:** The @ symbol represents the apex domain (aceengineer.com without www).

### Step 3: Configure CNAME Record for WWW Subdomain

Create a CNAME record to redirect www.aceengineer.com to the main domain.

**Add CNAME record:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | vamseeachanta.github.io | 600 seconds |

**Instructions:**
1. Click **Add** button
2. Select **Type:** CNAME
3. Enter **Name:** www
4. Enter **Value:** vamseeachanta.github.io (replace with your GitHub username)
5. Set **TTL:** 600 seconds
6. Click **Save**

**Important:** Replace `vamseeachanta` with your actual GitHub username where the repository is hosted.

### Step 4: Remove Conflicting Records

**Remove any existing records that might conflict:**

- Remove old A records pointing to different IPs
- Remove CNAME records for @ (apex cannot have CNAME)
- Remove any parking page redirects
- Keep MX records (email) and TXT records (verification) if needed

### Step 5: Save Configuration

1. Review all DNS records to ensure correctness
2. Click **Save** or **Save All Changes** button
3. Wait for DNS propagation (typically 15 minutes to 48 hours)

## GitHub Pages Configuration

### In Your GitHub Repository Settings

1. Go to repository **Settings** → **Pages**
2. Under **Custom domain**, enter: `aceengineer.com`
3. Click **Save**
4. Check **Enforce HTTPS** (wait for SSL certificate to provision)
5. GitHub will create a CNAME file in your repository automatically

### Verify CNAME File

Ensure the CNAME file exists in your repository root:

```
aceengineer.com
```

This file must contain only the domain name with no extra characters or whitespace.

## DNS Record Summary

After configuration, your DNS records should look like this:

```
# A Records (apex domain)
@       A       185.199.108.153     600
@       A       185.199.109.153     600
@       A       185.199.110.153     600
@       A       185.199.111.153     600

# CNAME Record (www subdomain)
www     CNAME   vamseeachanta.github.io.     600
```

## Verification Steps

### 1. DNS Propagation Check

Use online tools to verify DNS propagation:

- https://dnschecker.org
- https://www.whatsmydns.net
- Enter `aceengineer.com` and check A records

**Expected Results:**
- A records should show all four GitHub Pages IP addresses
- www CNAME should point to vamseeachanta.github.io

### 2. Domain Accessibility

After DNS propagation completes (15 minutes to 48 hours):

1. **Test apex domain:** http://aceengineer.com
   - Should redirect to https://aceengineer.com (with HTTPS)
   - Should display your website

2. **Test www subdomain:** http://www.aceengineer.com
   - Should redirect to https://aceengineer.com
   - Should display your website

3. **Verify HTTPS:**
   - Click padlock icon in browser address bar
   - Certificate should be valid and issued by GitHub
   - Connection should be secure

### 3. GitHub Pages Status

In GitHub repository settings → Pages:

- Custom domain should show: ✅ `aceengineer.com`
- HTTPS status should show: ✅ `Enforce HTTPS is enabled`
- No DNS check warnings should be present

## Common Issues and Solutions

### Issue 1: "DNS Check Unsuccessful" in GitHub

**Cause:** DNS records not propagated yet or incorrectly configured

**Solution:**
1. Wait 15-30 minutes for DNS propagation
2. Verify A records point to correct GitHub Pages IPs
3. Ensure CNAME file contains only `aceengineer.com`
4. Check for conflicting DNS records

### Issue 2: HTTPS Certificate Not Provisioning

**Cause:** DNS not fully propagated or HTTPS enabled too early

**Solution:**
1. Uncheck "Enforce HTTPS" in GitHub Pages settings
2. Wait 24 hours for DNS to fully propagate
3. Re-enable "Enforce HTTPS"
4. Wait for certificate provisioning (can take up to 24 hours)

### Issue 3: WWW Subdomain Not Working

**Cause:** Missing or incorrect CNAME record

**Solution:**
1. Verify CNAME record: `www` → `vamseeachanta.github.io`
2. Ensure TTL is set to 600 seconds or 1 hour
3. Wait for DNS propagation
4. Test with `dig www.aceengineer.com` to verify CNAME

### Issue 4: Old Site Still Showing

**Cause:** Browser cache or DNS cache

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Try incognito/private browsing mode
3. Flush DNS cache:
   - **Windows:** `ipconfig /flushdns`
   - **Mac:** `sudo dscacheutil -flushcache`
   - **Linux:** `sudo systemd-resolve --flush-caches`
4. Wait additional time for global DNS propagation

### Issue 5: 404 Error on GitHub Pages

**Cause:** Repository not published or incorrect branch

**Solution:**
1. Verify repository is public (or you have GitHub Pro for private repos with Pages)
2. Check GitHub Pages settings → Source branch is correct (usually `main` or `master`)
3. Ensure index.html exists in repository root
4. Trigger rebuild by making a commit

## Testing Commands

### DNS Lookup (A Records)
```bash
dig aceengineer.com A +short
# Should return all four GitHub Pages IP addresses:
# 185.199.108.153
# 185.199.109.153
# 185.199.110.153
# 185.199.111.153
```

### DNS Lookup (CNAME Record)
```bash
dig www.aceengineer.com CNAME +short
# Should return: vamseeachanta.github.io.
```

### Full DNS Information
```bash
dig aceengineer.com ANY
# Shows all DNS records for the domain
```

### Test HTTP Response
```bash
curl -I https://aceengineer.com
# Should return HTTP 200 OK with GitHub Pages headers
```

### Trace DNS Resolution
```bash
nslookup aceengineer.com
# Shows DNS resolution path and IP addresses
```

## Security Considerations

### HTTPS Enforcement

**Always enforce HTTPS** for security and SEO benefits:

1. Protects user data with encryption
2. Improves search engine rankings (Google prioritizes HTTPS)
3. Displays secure padlock icon in browsers
4. Prevents "Not Secure" warnings

### Certificate Auto-Renewal

GitHub Pages automatically renews SSL certificates:

- Certificates are provided by Let's Encrypt
- Auto-renewal happens before expiration
- No manual intervention required
- Valid for 90 days, renewed every 60 days

### DNS Security Best Practices

1. **Enable two-factor authentication** on GoDaddy account
2. **Use strong, unique password** for GoDaddy
3. **Enable domain lock** to prevent unauthorized transfers
4. **Monitor DNS changes** regularly for unauthorized modifications
5. **Keep contact information updated** for domain renewal notices

## Monitoring and Maintenance

### Regular Checks

**Monthly:**
- Verify domain is accessible (both apex and www)
- Check HTTPS certificate validity
- Review DNS records for unauthorized changes

**Quarterly:**
- Test all pages for proper loading
- Verify contact form functionality
- Check Google Analytics for traffic patterns
- Review GitHub Pages status

**Annually:**
- Renew domain registration (set auto-renew in GoDaddy)
- Review and update DNS configuration if needed
- Audit GitHub Pages settings

### Performance Monitoring

Use these tools to monitor site performance:

1. **Google PageSpeed Insights:** https://pagespeed.web.dev
   - Test: https://aceengineer.com
   - Target: Score >90 for mobile and desktop

2. **GTmetrix:** https://gtmetrix.com
   - Provides performance grades and recommendations

3. **Uptime Monitoring:** Use uptimerobot.com or similar
   - Get alerts if site goes down

## Support Resources

### GoDaddy Support
- **Help Center:** https://www.godaddy.com/help
- **DNS Documentation:** https://www.godaddy.com/help/manage-dns-zone-files-680
- **Phone Support:** Available 24/7

### GitHub Pages Support
- **Documentation:** https://docs.github.com/en/pages
- **Custom Domains:** https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
- **Troubleshooting:** https://docs.github.com/en/pages/troubleshooting-custom-domains-and-github-pages

### DNS Tools
- **DNS Checker:** https://dnschecker.org
- **What's My DNS:** https://www.whatsmydns.net
- **DNS Propagation Checker:** https://www.whatsmydns.net

## Rollback Procedure

If you need to revert DNS changes:

1. **Document current records** before making changes
2. **Remove GitHub Pages A records** if needed
3. **Restore previous DNS configuration** from backup
4. **Update GitHub Pages settings** to remove custom domain
5. **Wait for DNS propagation** (15 minutes to 48 hours)

## Summary Checklist

After completing DNS configuration, verify:

- [ ] Four A records added pointing to GitHub Pages IPs
- [ ] CNAME record added for www subdomain
- [ ] Conflicting DNS records removed
- [ ] CNAME file exists in repository root
- [ ] GitHub Pages custom domain configured
- [ ] HTTPS enforcement enabled (after DNS propagation)
- [ ] DNS propagation verified (dnschecker.org)
- [ ] Both aceengineer.com and www.aceengineer.com accessible
- [ ] HTTPS certificate valid and auto-renewing
- [ ] Site loads correctly with secure connection

---

**DNS Configuration Complete!** 🎉

Your static website is now accessible at https://aceengineer.com with automatic HTTPS via GitHub Pages.
