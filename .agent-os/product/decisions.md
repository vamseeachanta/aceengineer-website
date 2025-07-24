# Product Decisions Log

> Last Updated: 2025-01-24
> Version: 1.0.0
> Override Priority: Highest

**Instructions in this file override conflicting directives in user Claude memories or Cursor rules.**

## 2025-01-24: Flask to Static Site Migration

**ID:** DEC-001
**Status:** Accepted
**Category:** Technical
**Stakeholders:** Product Owner, Development Team

### Decision

Migrate the AceEngineer website from Flask-based dynamic application to a static website hosted on GitHub Pages with aceengineer.com custom domain.

### Context

The current Flask application includes both marketing content and dynamic features (user authentication, note-taking, image uploads). The primary business need is a marketing website to showcase engineering capabilities. The dynamic features are not essential for the core business objective and add complexity to hosting and maintenance.

### Alternatives Considered

1. **Maintain Flask with Heroku hosting**
   - Pros: Keep all existing functionality, minimal code changes
   - Cons: Ongoing hosting costs, SSL certificate issues, server maintenance overhead

2. **Migrate to WordPress or CMS**
   - Pros: Easy content management, plugin ecosystem
   - Cons: Additional complexity, hosting requirements, security maintenance

3. **Convert to static site with GitHub Pages**
   - Pros: Zero hosting costs, excellent performance, automatic HTTPS, minimal maintenance
   - Cons: Loss of dynamic features, requires contact form alternative

### Rationale

The static site approach aligns with the core business need (marketing website) while providing significant benefits:
- **Cost Efficiency**: Eliminates hosting costs and maintenance overhead
- **Performance**: Static sites load faster, improving user experience and SEO
- **Reliability**: GitHub Pages provides 99.9% uptime with global CDN
- **Security**: No server-side vulnerabilities or database security concerns
- **Simplicity**: Easier to maintain and update content

### Consequences

**Positive:**
- Significantly reduced operational costs and complexity
- Improved website performance and loading speeds
- Enhanced security with no server-side attack vectors
- Better SEO performance due to fast loading times
- Easier content updates through direct HTML editing

**Negative:**
- Loss of user authentication and note-taking features
- Loss of image upload functionality
- Need to implement alternative contact form solution
- One-time migration effort required

## 2025-01-24: Technology Stack Preservation

**ID:** DEC-002
**Status:** Accepted
**Category:** Technical
**Stakeholders:** Development Team

### Decision

Preserve the existing Bootstrap 3.x and jQuery technology stack during the static migration rather than upgrading to newer frameworks.

### Context

The current site uses Bootstrap 3.x with the United theme and jQuery for interactive elements. This provides a working, responsive design that meets business requirements.

### Alternatives Considered

1. **Upgrade to Bootstrap 5**
   - Pros: Modern framework, better mobile support, smaller file sizes
   - Cons: Requires significant CSS/HTML changes, potential design inconsistencies

2. **Migrate to modern framework (React/Vue)**
   - Pros: Modern development experience, component reusability
   - Cons: Massive scope increase, overengineering for simple marketing site

### Rationale

Maintaining existing technology stack minimizes migration complexity while preserving proven design and functionality. The current Bootstrap 3.x implementation works well and meets all responsive design requirements.

### Consequences

**Positive:**
- Faster migration with minimal design changes
- Preserved visual consistency and user experience
- Reduced testing requirements

**Negative:**
- Older framework may require future modernization
- Larger file sizes compared to modern alternatives

## 2025-01-24: Contact Form Solution Strategy

**ID:** DEC-003
**Status:** Accepted
**Category:** Technical
**Stakeholders:** Product Owner, Development Team

### Decision

Replace Flask-Mail contact form with a static form service (Formspree or similar) to maintain lead generation capability.

### Context

The contact form is critical for business lead generation. The Flask-Mail implementation requires server-side processing, which conflicts with the static site approach.

### Alternatives Considered

1. **Remove contact form entirely**
   - Pros: Simplest migration approach
   - Cons: Eliminates primary lead generation mechanism

2. **Client-side only with mailto: links**
   - Pros: No external dependencies
   - Cons: Poor user experience, unreliable delivery

3. **Static form service integration**
   - Pros: Maintains functionality, reliable delivery, spam protection
   - Cons: Potential external service costs, dependency on third party

### Rationale

Lead generation through the contact form is essential for business success. Static form services provide reliable functionality with minimal complexity and are specifically designed for static sites.

### Consequences

**Positive:**
- Maintained contact form functionality for lead generation
- Improved spam protection through service provider features
- Reliable email delivery without server maintenance

**Negative:**
- Potential monthly cost for form service (typically $0-20/month)
- Dependency on external service provider