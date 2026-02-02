# Deployment Guide for Cloudflare Pages

This guide provides step-by-step instructions for deploying the Michael Vadney Author Site to Cloudflare Pages.

## Prerequisites

- A Cloudflare account (free tier is sufficient)
- Access to the GitHub repository
- Node.js v20 or higher (for local testing)

## Quick Start

### Option 1: Deploy via Cloudflare Dashboard (Recommended for first-time setup)

1. **Login to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to "Workers & Pages" in the left sidebar

2. **Create a New Pages Project**
   - Click "Create application"
   - Select "Pages" tab
   - Click "Connect to Git"

3. **Connect Your GitHub Repository**
   - Authorize Cloudflare to access your GitHub account (if not already done)
   - Select the `missingpiecetech/author-site-temp` repository
   - Click "Begin setup"

4. **Configure Build Settings**
   - **Project name**: `author-site` (or your preferred name)
   - **Production branch**: `main` (or your default branch)
   - **Framework preset**: None (or select Vite if available)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `client`
   - **Environment variables**: None required (unless you add API keys later)

5. **Deploy**
   - Click "Save and Deploy"
   - Wait for the build to complete (usually 2-3 minutes)
   - Your site will be live at `https://<project-name>.pages.dev`

### Option 2: Deploy via Wrangler CLI

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Deploy from project root**
   ```bash
   cd client
   npm install
   npm run build
   npx wrangler pages deploy dist --project-name=author-site
   ```

## Build Configuration

### Build Command
```bash
npm run build
```

### Output Directory
```
dist
```

When the root directory is set to `client`, the output directory is relative to that root.

### Node Version
The project requires Node.js v20 or higher. A `.nvmrc` file is included in the repository root.

### Environment Variables
Currently, no environment variables are required. If you need to add any in the future (e.g., API keys), add them in:
- Cloudflare Dashboard: Project Settings → Environment variables
- Wrangler: Create a `.dev.vars` file (for local dev) or use `wrangler secret put`

## SPA Routing

The project uses React Router for client-side routing. A `_redirects` file is included in `client/public/` to ensure all routes are properly handled:

```
/* /index.html 200
```

This file tells Cloudflare Pages to serve `index.html` for all routes, allowing React Router to handle navigation.

## Custom Domain Setup (Optional)

1. **In Cloudflare Dashboard**
   - Go to your Pages project
   - Click on "Custom domains" tab
   - Click "Set up a custom domain"

2. **Add Your Domain**
   - Enter your domain name (e.g., `michaelvadney.com`)
   - Follow the DNS configuration instructions
   - If your domain is already on Cloudflare, DNS records will be automatically created

3. **Wait for DNS Propagation**
   - SSL certificate provisioning: ~1-5 minutes
   - DNS propagation: Up to 24 hours (usually much faster)

## Automatic Deployments

Once connected to GitHub, Cloudflare Pages will automatically:
- Deploy the production branch on every push
- Create preview deployments for pull requests
- Provide unique URLs for each deployment

### Preview Deployments
- Every PR gets a unique preview URL
- Preview URL format: `https://<commit-hash>.<project-name>.pages.dev`
- Automatically updated when PR is updated

## Rollback Procedure

If you need to rollback to a previous deployment:

1. Go to your Pages project in Cloudflare Dashboard
2. Navigate to "Deployments" tab
3. Find the deployment you want to rollback to
4. Click "⋯" menu and select "Rollback to this deployment"

## Local Development

To test the site locally before deploying:

```bash
cd client
npm install
npm run dev
```

The site will be available at `http://localhost:5173`

### Preview Production Build Locally

```bash
cd client
npm run build
npm run preview
```

This serves the production build locally at `http://localhost:4173`

## Troubleshooting

### Build Failures

**Issue**: Build fails with "command not found" errors
- **Solution**: Ensure the root directory is set to `client` in Cloudflare Pages settings
- **Check**: Build command should be `npm run build` (not `cd client && npm run build`)
- **Check**: Build output directory is set to `dist` (not `client/dist`)

**Issue**: Build runs out of memory
- **Solution**: Cloudflare Pages provides 8GB memory for builds, which should be sufficient for this project. If issues persist, optimize dependencies.

### Routing Issues

**Issue**: Direct URLs (e.g., `/about`, `/books`) return 404
- **Solution**: Verify `_redirects` file exists in `client/public/` directory
- **Check**: File contains `/* /index.html 200`

**Issue**: Routing works on homepage but not on direct URLs
- **Solution**: Clear Cloudflare cache and redeploy

### Performance Issues

**Issue**: Slow initial load
- **Solution**: Cloudflare Pages includes automatic caching and edge deployment
- **Check**: Use Cloudflare's Web Analytics to identify bottlenecks
- **Optimize**: Consider code splitting or lazy loading heavy components

## Security & Best Practices

- **HTTPS**: Automatically enabled on all Cloudflare Pages deployments
- **CDN**: Content automatically distributed across Cloudflare's global network
- **DDoS Protection**: Included with Cloudflare Pages
- **Secrets**: Never commit API keys or secrets to the repository. Use Environment Variables instead
- **Dependencies**: Regularly update dependencies to patch security vulnerabilities

## CI/CD Integration

The site is configured for continuous deployment:

1. **Push to main branch** → Automatic production deployment
2. **Open PR** → Automatic preview deployment
3. **Merge PR** → Preview cleaned up, production updated

## Monitoring & Analytics

### Cloudflare Web Analytics (Recommended)
1. Go to "Analytics & Logs" in your Cloudflare dashboard
2. Enable "Web Analytics"
3. Add the provided script tag to `client/index.html` (optional, as Pages includes basic analytics)

### Built-in Pages Analytics
- Cloudflare Pages provides built-in analytics
- View at: Project → Analytics tab
- Includes: Page views, bandwidth, requests, and more

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Cloudflare Community](https://community.cloudflare.com/)

## Support

For issues specific to:
- **This application**: Open an issue in the GitHub repository
- **Cloudflare Pages**: Visit [Cloudflare Community](https://community.cloudflare.com/)
- **Build/deployment**: Check Cloudflare Pages build logs in the dashboard

## Cost

Cloudflare Pages is **free** for:
- Unlimited bandwidth
- Unlimited requests
- 500 builds per month
- 1 build at a time
- Automatic HTTPS
- DDoS protection

For higher limits, consider the Cloudflare Pages Pro plan.
