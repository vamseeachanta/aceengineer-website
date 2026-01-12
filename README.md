# AceEngineer Website

**Live Site:** https://aceengineer.com/

A static marketing and technical showcase website for AceEngineer - an AI-native engineering consulting platform.

## Quick Links

- **Production Site**: https://aceengineer.com
- **GitHub Repository**: https://github.com/vamseeachanta/aceengineer-website
- **Deployment**: Vercel
- **Domain**: GoDaddy (managed DNS)

## Deployment

This site is deployed on **Vercel** using a static HTML/CSS/JavaScript architecture.

### Current Setup

- **Hosting**: Vercel
- **Domain**: aceengineer.com (via GoDaddy)
- **SSL**: Automatic HTTPS (Vercel-managed)
- **Deployment Branch**: `main`
- **Build**: Static files (no build process needed)

### Making Changes

1. **Edit HTML files** in the root directory
2. **Commit and push** to `main` branch
3. **Vercel automatically deploys** within 1-2 minutes
4. **Changes live** at https://aceengineer.com

### DNS Configuration

If you need to reconfigure the domain:

1. **GoDaddy Dashboard** → Select aceengineer.com
2. **DNS Management**
3. **Nameservers** should point to:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ns3.vercel-dns.com
   ns4.vercel-dns.com
   ```

## Project Structure

```
aceengineer-website/
├── index.html              # Home page
├── about.html              # About page
├── engineering.html        # Engineering services
├── energy.html             # Energy sector focus
├── faq.html                # Frequently asked questions
├── contact.html            # Contact form
├── 404.html                # Custom 404 error page
├── assets/
│   ├── css/                # Stylesheets (Bootstrap)
│   ├── js/                 # JavaScript files
│   ├── img/                # Images
│   └── svg/                # SVG graphics
├── docs/                   # Documentation
├── .agent-os/              # Agent OS configuration
├── vercel.json             # Vercel configuration
└── CNAME                   # Domain name (aceengineer.com)
```

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Bootstrap 3.x framework
- **JavaScript** - jQuery for interactivity
- **Deployment** - Vercel static hosting
- **Domain** - GoDaddy DNS management

## Key Features

- ✅ Fast loading (static files)
- ✅ Responsive design (mobile-friendly)
- ✅ SEO optimized (meta tags, sitemap, robots.txt)
- ✅ HTTPS/SSL automatic
- ✅ Global CDN distribution
- ✅ Contact form (static form service)
- ✅ 99.9% uptime

## SEO & Performance

- **Sitemap**: `sitemap.xml`
- **Robots**: `robots.txt`
- **Schema Markup**: Structured data for rich snippets
- **PageSpeed**: Optimized for fast loading
- **Meta Tags**: Comprehensive SEO optimization

## Documentation

- **Deployment Guide**: See `VERCEL_DEPLOY.md`
- **Product Mission**: See `.agent-os/product/mission.md`
- **Technical Architecture**: See `.agent-os/product/tech-stack.md`
- **Roadmap**: See `.agent-os/product/roadmap.md`

## Development Workflow

### Local Development

1. Clone the repository
2. Edit HTML files in root directory
3. Test locally by opening HTML files in browser
4. Use `npx http-server` for local testing with proper paths

### Deployment

- Push changes to `main` branch
- Vercel automatically deploys (1-2 minutes)
- Changes live at https://aceengineer.com

### Monitoring

- Check Vercel dashboard for deployment status
- Verify HTTPS certificate validity
- Monitor uptime and performance metrics

## Previous Deployment

**Migrated from**: GitHub Pages (January 2025)
**Migration Details**: See `VERCEL_DEPLOY.md`

## Support

For deployment or technical issues:
1. Check Vercel dashboard: https://vercel.com/dashboard
2. Check domain DNS: GoDaddy DNS settings
3. Review `VERCEL_DEPLOY.md` for troubleshooting

## Current Phase: Phase 4 & 6 Strategic Planning

### ✅ Phase 1 Completed (Jan 12, 2025)
- Removed 41 legacy files (9,119 lines deleted)
- Deleted Flask dependencies and Agent OS infrastructure
- Cleaned up Python scripts and templates
- Repository now focused on static site only

### 📋 Next Priority Items

**Phase 4: Performance & SEO (In Progress)**
1. ⏳ Set up Google Analytics GA4 tracking
2. ⏳ Run PageSpeed audit and optimize
3. ⏳ Validate all internal/external links
4. ⏳ Optimize images for performance

**Phase 6: Content Strategy & Growth (Planning)**
1. Create GitHub organization with 5+ repositories
2. Write technical blog (2-4 posts/month)
3. Develop detailed case studies (3-5 studies)
4. Build methodology documentation
5. Create interactive calculators/tools
6. Set up newsletter and email nurture

See **PHASE_4_AND_6_PLAN.md** for complete strategy and roadmap.

## Strategic Opportunity: Phase 6 Content Strategy

The next major opportunity is **Phase 6: Content Strategy & Growth**, which transforms this site from a marketing website into a **technical authority platform** that pre-qualifies leads through demonstrated expertise.

**Why this matters**:
- Traditional engineering consultants hide methodology behind NDAs
- AceEngineer differentiates through **open-source code** and **transparent validation**
- Technical evaluators can assess capabilities before first contact
- Results in **faster sales cycles** and **higher-quality leads**

**Implementation**: See PHASE_4_AND_6_PLAN.md for 12-month content roadmap with:
- 20+ blog posts targeting AI-native engineering keywords
- 5+ detailed case studies with methodology documentation
- GitHub organization with 10+ public repositories
- Interactive calculators and technical demonstrations
- Email newsletter and lead nurture strategy

---

*Last Updated: January 12, 2025*
