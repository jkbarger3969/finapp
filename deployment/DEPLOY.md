# Production Deployment Guide

## Quick Deploy Commands

### 1. On Remote Server - Pull Latest Code

```bash
# SSH to server
ssh keith@172.16.2.5

# Navigate to project
cd ~/finapp

# Pull latest changes
git pull origin main

# Update Nginx configuration
sudo cp deployment/nginx/finapp.conf /etc/nginx/sites-available/finapp
sudo nginx -t
sudo systemctl restart nginx

# Update backend environment
cp graphql/.env.production graphql/.env
nano graphql/.env  # Add your SMTP credentials

# Rebuild frontend
cd client
npm run build

# Restart backend
cd ../graphql
sudo systemctl restart finapp-api
```

### 2. Verify Deployment

```bash
# Check Nginx status
sudo systemctl status nginx

# Check backend status
sudo systemctl status finapp-api

# View backend logs
sudo journalctl -u finapp-api -f
```

### 3. Test Access

From external network:
- Visit: https://finapp.lonestarcowboychurch.org
- Test Google sign-in
- Send test invite email

## Configuration Files Reference

| File | Location on Server | Purpose |
|------|-------------------|---------|
| `deployment/nginx/finapp.conf` | `/etc/nginx/sites-available/finapp` | Nginx HTTPS config |
| `graphql/.env.production` | `/home/keith/finapp/graphql/.env` | Backend environment |
| `client/.env.production` | `/home/keith/finapp/client/.env.production` | Frontend environment (auto-used) |

## Important Notes

- **SMTP Credentials**: Update in `graphql/.env` after copying from `.env.production`
- **SSL Certificate**: Must be at `/etc/letsencrypt/live/finapp.lonestarcowboychurch.org/`
- **Port Forwarding**: Router must forward ports 80 and 443 to 172.16.2.5
- **Google OAuth**: Redirect URI must be `https://finapp.lonestarcowboychurch.org/login`

## Troubleshooting

**Nginx fails to start:**
```bash
sudo nginx -t  # Check for syntax errors
sudo journalctl -xe  # View error logs
```

**Backend not responding:**
```bash
sudo systemctl status finapp-api
sudo journalctl -u finapp-api -n 50
```

**Frontend shows old version:**
```bash
cd ~/finapp/client
npm run build
sudo systemctl restart nginx
```
