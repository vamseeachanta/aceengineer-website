# Technical Stack

> Last Updated: 2025-01-24
> Version: 1.0.0

## Current Architecture (Flask-based)

### Application Framework
- **Framework:** Flask (Python)
- **Version:** Latest stable
- **Language:** Python 3.x

### Database System
- **Database:** SQLite
- **Purpose:** User authentication, notes, image uploads
- **Files:** users.db, notes.db, images.db

### Frontend Technologies
- **CSS Framework:** Bootstrap 3.x (United theme)
- **JavaScript Library:** jQuery
- **Template Engine:** Jinja2
- **SEO Management:** YAML configuration files

## Target Architecture (Static Website)

### Static Site Generation
- **Approach:** Manual conversion from Flask templates to static HTML
- **Output:** Pure HTML/CSS/JavaScript files
- **Build Process:** Manual template processing and asset optimization

### Frontend Stack
- **CSS Framework:** Bootstrap 3.x (maintaining current styling)
- **JavaScript Library:** jQuery (for interactive elements)
- **Icons:** SVG-based custom logo and graphics
- **Fonts:** Web-safe fonts with fallbacks

### Content Management
- **SEO Data:** YAML files for metadata management
- **Static Assets:** Organized in assets/ directory structure
- **Images:** Optimized static images in assets/img/

## Infrastructure

### Application Hosting
- **Platform:** GitHub Pages
- **Custom Domain:** aceengineer.com (via GoDaddy DNS)
- **SSL:** Automatic HTTPS via GitHub Pages
- **CDN:** GitHub's global CDN

### Asset Storage
- **Images:** Hosted directly in repository
- **CSS/JS:** Minified and served from assets/ directory
- **Optimization:** Image compression and asset minification

### Contact Form Solution
- **Current:** Flask-Mail with server-side processing
- **Target:** Static form solution (Formspree, Netlify Forms, or similar)
- **Features:** Email notification, form validation, spam protection

## Deployment

### Version Control
- **Repository:** GitHub (vamseeachanta/aceengineer-website)
- **Branch Strategy:** 
  - main: Production static site
  - deploy-on-godaddy: Current development branch

### CI/CD Pipeline
- **Platform:** GitHub Actions
- **Trigger:** Push to main branch
- **Process:** Static site generation and deployment
- **Testing:** HTML validation and link checking

### DNS Configuration
- **Provider:** GoDaddy
- **Setup:** CNAME records pointing to GitHub Pages
- **Records:**
  - A records: GitHub Pages IP addresses
  - CNAME: www subdomain to GitHub Pages

## Migration Requirements

### Static Conversion Tasks
- **Template Processing:** Convert Jinja2 templates to static HTML
- **Asset Optimization:** Minify CSS/JS and optimize images
- **URL Structure:** Maintain existing URL patterns for SEO
- **Contact Form:** Implement static form solution

### Feature Removals
- **User Authentication:** Remove login/registration functionality
- **Dynamic Content:** Remove note-taking and image upload features
- **Database Dependencies:** Eliminate SQLite database requirements
- **Server-side Processing:** Remove all Flask route handlers

### SEO Preservation
- **Meta Tags:** Maintain existing YAML-driven SEO structure
- **URL Redirects:** Ensure no broken links during migration
- **Sitemap:** Generate static sitemap.xml
- **Analytics:** Integrate Google Analytics for tracking