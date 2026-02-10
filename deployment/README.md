# Deployment Configuration Files

This directory contains configuration files for deploying the FinApp to production.

## Files

### nginx/finapp.conf
Production Nginx configuration with:
- HTTPS redirect
- SSL/TLS configuration
- Security headers
- Static file caching
- GraphQL API proxy

**Installation:**
```bash
sudo cp deployment/nginx/finapp.conf /etc/nginx/sites-available/finapp
sudo ln -sf /etc/nginx/sites-available/finapp /etc/nginx/sites-enabled/finapp
sudo nginx -t
sudo systemctl restart nginx
```

### Environment Files

#### graphql/.env.production
Backend production environment template.

**Installation:**
```bash
# Copy to actual .env and update with real credentials
cp graphql/.env.production graphql/.env
nano graphql/.env  # Update SMTP credentials
```

#### client/.env.production
Frontend production environment configuration.

**No installation needed** - automatically used during `npm run build`

## Production URLs

- **App**: https://finapp.lonestarcowboychurch.org
- **API**: https://finapp.lonestarcowboychurch.org/graphql

## Server Requirements

- Ubuntu/Debian server
- Nginx installed
- Node.js 18+ installed
- MongoDB running
- SSL certificate from Let's Encrypt
- Ports 80 and 443 forwarded to server

## Quick Deploy

See `deployment/DEPLOY.md` for complete deployment instructions.
