# Google Analytics GA4 Setup Guide

> Date: January 12, 2025
> Status: Ready for Implementation
> Estimated Setup Time: 30 minutes

---

## Overview

This guide walks through setting up Google Analytics 4 (GA4) for aceengineer.com, enabling tracking of visitor behavior, content engagement, and lead generation metrics.

**Why GA4?**
- Modern analytics platform (replaces Universal Analytics)
- Better bot filtering and privacy-friendly defaults
- Event-based tracking (superior to session-based)
- AI-powered insights and anomaly detection
- Integration with Search Console for organic traffic insights

---

## Step 1: Create GA4 Property

### Prerequisites
- Google account (can use any Gmail account)
- Admin access to Analytics (will be the Account owner)

### Instructions

1. **Go to Google Analytics**: https://analytics.google.com/
2. **Sign in** with your Google account
3. **Create New Account**:
   - Click **Create** button (bottom left)
   - Select **Create Account**
   - Account name: `AceEngineer Website` (or similar)
   - Click **Next**

4. **Create Property**:
   - Property name: `aceengineer.com`
   - Reporting timezone: **US/Chicago** (Houston, TX)
   - Currency: **USD**
   - Business type: **Service Provider** or **Consulting**
   - Click **Next**

5. **Business Details**:
   - Company size: **Small**
   - Main objective: **Get insights about your users**
   - Select business objectives:
     - ☑️ Get insights about your users
     - ☑️ Generate leads
     - ☑️ Get more website traffic
   - Click **Create**

6. **Data Stream Setup**:
   - Platform: **Web**
   - Website URL: `https://aceengineer.com`
   - Stream name: `aceengineer.com - main`
   - Enable Enhanced Measurement: **YES** (recommended)
   - Click **Create stream**

### Result
You'll receive a **Measurement ID** (G-XXXXXXXXXX). **Copy this—you'll need it for all pages.**

---

## Step 2: Add GA4 Tracking Script to All Pages

### The Tracking Script

Insert this script in the `<head>` section of every HTML page, right before the closing `</head>` tag:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    'page_path': window.location.pathname,
    'anonymize_ip': true
  });
</script>
```

**Replace `G-XXXXXXXXXX` with your actual Measurement ID.**

### Pages to Update

Add the script to these pages:
- ✅ `index.html` - Home
- ✅ `about.html` - About
- ✅ `engineering.html` - Engineering
- ✅ `energy.html` - Energy
- ✅ `faq.html` - FAQ
- ✅ `contact.html` - Contact
- ✅ `404.html` - Error page
- ✅ `blog/index.html` - Blog
- ✅ `blog/ai-native-structural-analysis.html` - Blog posts
- ✅ All future blog posts

### Implementation

For each HTML file:

1. **Open file in editor**
2. **Find the closing `</head>` tag**
3. **Add the GA4 script BEFORE `</head>`**
4. **Replace `G-XXXXXXXXXX` with your Measurement ID**
5. **Save and commit to git**

Example location in HTML:
```html
<head>
    <meta charset="UTF-8">
    ...
    <link rel="stylesheet" href="assets/css/bootstrap.min.united.css">
    <script src="assets/js/jquery.min.js"></script>
    <script src="assets/js/bootstrap.min.js"></script>

    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX', {
        'page_path': window.location.pathname,
        'anonymize_ip': true
      });
    </script>
</head>
```

---

## Step 3: Track Contact Form Submissions

### Goal: Capture Contact Form as Conversion Event

In `contact.html`, add this event tracking to the form submission:

**Find the contact form**, then add this JavaScript after the form:

```html
<!-- Contact Form Event Tracking -->
<script>
document.getElementById('contact-form').addEventListener('submit', function() {
  // Send event to Google Analytics
  gtag('event', 'contact_form_submission', {
    'event_category': 'contact',
    'event_label': 'contact_form_submit'
  });
});
</script>
```

This tracks every contact form submission as a conversion event in GA4.

### Verification in Analytics

After implementing:
1. Go to **Analytics Dashboard** → **Events**
2. Look for `contact_form_submission` event
3. Should see events populate within 24-48 hours

---

## Step 4: Set Up Search Console Integration

### Connect Google Search Console

This shows you which search queries bring people to your site.

1. **Go to Google Search Console**: https://search.google.com/search-console/
2. **Add Property**: `https://aceengineer.com`
3. **Verify ownership**: Follow Google's verification process (usually via Google Analytics)
4. **Submit Sitemap**: Add `https://aceengineer.com/sitemap.xml`

### Link Search Console to GA4

1. Go to **Analytics Admin** (gear icon) → **Property Settings** → **Search Console links**
2. Click **Link**
3. **Select Search Console property**: `aceengineer.com`
4. Click **Confirm**

Now you'll see organic search keywords and performance in Analytics.

---

## Step 5: Verify Implementation

### Real-Time Report

Verify tracking is working:

1. Open Analytics Dashboard
2. Go to **Real-time** section
3. Open `https://aceengineer.com` in a new browser window
4. Within 5-10 seconds, you should see:
   - **1 user** in Real-time
   - The page you visited listed
   - Device, location, and source info

### Debugging (If Tracking Not Working)

1. **Check Measurement ID**: Verify you're using the correct G-XXXXX ID
2. **Check Script Placement**: Verify GA script is in `<head>`, before `</head>`
3. **Check No Errors**: Open browser console (F12), check for JavaScript errors
4. **Wait 24 Hours**: Analytics can take 24-48 hours for initial data
5. **Check Ad Blocker**: Some ad blockers prevent GA from loading

---

## Step 6: Configure Important Goals & Events

### Pre-configured Events (Automatic)

GA4 automatically tracks:
- ✅ Page views
- ✅ Scroll depth
- ✅ Outbound clicks
- ✅ File downloads
- ✅ Form submissions (if enhanced measurement enabled)

### Custom Events to Add (Optional)

For deeper insights, consider tracking:

**Blog Post Views**:
```html
<script>
gtag('event', 'view_blog_post', {
  'event_category': 'blog',
  'event_label': 'ai-native-structural-analysis',
  'blog_title': 'AI-Native Structural Analysis'
});
</script>
```

**GitHub Link Clicks**:
```html
<script>
gtag('event', 'click_github_link', {
  'event_category': 'outbound',
  'event_label': 'github'
});
</script>
```

---

## Step 7: Create Dashboard

### Custom Dashboard for Key Metrics

In Analytics, create a dashboard to monitor:

1. **Users** - Daily active users
2. **Sessions** - How many visit per day
3. **Page Views** - Total page views
4. **Bounce Rate** - % of single-page visits
5. **Contact Form Submissions** - Conversion goal
6. **Top Pages** - Most-viewed content
7. **Top Traffic Sources** - Where visitors come from

**To create dashboard**:
1. Go to **Dashboards** (left menu)
2. Click **Create Dashboard**
3. Name: `Key Metrics`
4. Add cards for each metric above
5. Save

---

## Step 8: Set Up Alerts

### Email Alerts for Important Events

Configure analytics to email you when:
- Unusual spike in traffic (+50% above normal)
- Significant drop in sessions (>50% below normal)
- Contact form submissions received

**To set up alerts**:
1. Go to **Manage alerts** (left menu) → **Create** → **New alert**
2. Alert name: `High Traffic`
3. Condition: `Sessions is > [your normal daily number × 1.5]`
4. Notification method: **Email**
5. Click **Create alert**

---

## Step 9: Regular Monitoring

### Weekly Check-in

Every Monday, review:
- **Total visitors** last week
- **Top 3 pages** with most views
- **Traffic sources** (organic, direct, referral)
- **Contact form submissions**

### Monthly Review

End of each month:
- **Total visitors** for month
- **Blog post performance** - which posts got most views?
- **Conversion rate** (contact forms / visitors)
- **Trends** - are metrics improving or declining?
- **Opportunities** - what content should we create more of?

### Key Metrics to Watch

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Monthly Users | 300+ | Shows audience growth |
| Avg. Session Duration | 2+ minutes | Indicates engagement |
| Bounce Rate | <50% | % who leave without action |
| Contact Form Submission Rate | 1-2% | Lead conversion |
| Top Pages | Blog posts prominent | Content effectiveness |
| Traffic Sources | Organic dominant | SEO effectiveness |

---

## Troubleshooting

### Analytics Shows No Data

**Problem**: Tracking script added but Analytics shows 0 users

**Solutions** (in order):
1. **Verify Measurement ID** - Check you're using correct G-XXXXX ID
2. **Check Script Placement** - GA script must be in `<head>`, not `<body>`
3. **Clear Browser Cache** - `Ctrl+Shift+Delete` → Clear all
4. **Wait 24 Hours** - Analytics takes time to process data
5. **Check Ad Blocker** - Disable ad blockers and try again
6. **Use Analytics Debugger** - Install [GA Debugger extension](https://chrome.google.com/webstore/detail/google-analytics-debugger/) to verify hits

### Contact Form Events Not Showing

**Problem**: Contact form submissions not tracked as events

**Solutions**:
1. Verify JavaScript event listener is added to form
2. Test form submission - should see event in Real-time
3. Check browser console for JavaScript errors (F12)
4. Verify event name matches what you're looking for

### Seeing Bot Traffic

**Problem**: Analytics includes bot/crawler traffic, inflating numbers

**Solutions**:
1. Go to **Admin** → **Data Settings** → **Bot and Spider Traffic**
2. Enable **Exclude traffic from known bots and spiders** ✓
3. Create custom filter for known bot traffic if needed

---

## Integration with Blog Strategy

### How Analytics Supports Phase 6

GA4 will track:
1. **Blog post views** - Which technical topics resonate
2. **Reader engagement** - Time on page, scroll depth
3. **Traffic sources** - Which keywords drive traffic
4. **Conversions** - Which posts lead to contact form submissions

**Use this data to**:
- Double down on high-performing topics
- Optimize underperforming posts
- Understand what resonates with audience
- Measure ROI of content investment

---

## Next Steps

1. **Today**: Create GA4 property and get Measurement ID
2. **Tomorrow**: Add tracking script to all pages
3. **This Week**: Verify tracking is working
4. **Week 2**: Set up Search Console integration
5. **Week 3**: Publish first blog post and monitor traffic
6. **Weekly**: Check dashboard for trends

---

## Resources

- **GA4 Documentation**: https://support.google.com/analytics
- **Search Console**: https://search.google.com/search-console/
- **GA Debugger Extension**: https://chrome.google.com/webstore/detail/google-analytics-debugger/
- **GA4 Events Guide**: https://support.google.com/analytics/answer/9322688

---

## Measurement ID

**When you create your GA4 property, you'll receive a Measurement ID like this:**

```
G-XXXXXXXXXX
```

**Save this ID** - you'll use it for every page on the site.

---

**Ready to implement?** Create your GA4 property first, then add the tracking script to all pages in the next commit.
