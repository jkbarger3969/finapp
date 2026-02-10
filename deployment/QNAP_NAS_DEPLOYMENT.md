# QNAP NAS Receipt Storage - Production Deployment Guide

**Date**: February 10, 2026  
**Domain**: https://finapp.lonestarcowboychurch.org  
**Server**: 172.16.2.5 (keith@172.16.2.5)

---

## Overview

This guide covers deploying the receipt storage migration from Google Cloud Storage to QNAP NAS filesystem storage.

---

## Part 1: Deploy Code Changes to Production Server

### Step 1: SSH to Production Server

```bash
ssh keith@172.16.2.5
```

### Step 2: Navigate to FinApp Directory

```bash
cd ~/finapp
```

### Step 3: Pull Latest Changes from GitHub

```bash
git pull origin main
```

**Expected output:**
```
Updating f932bed7..729ea408
Fast-forward
 28 files changed, 3462 insertions(+), 1997 deletions(-)
 ...
```

### Step 4: Install New NPM Packages

**Backend (GraphQL):**
```bash
cd ~/finapp/graphql
npm install
```

This will install:
- `koa-static` - For serving static receipt files
- `koa-mount` - For mounting static file routes
- `@types/koa-static` and `@types/koa-mount` - TypeScript definitions

**Also removes:**
- `@google-cloud/storage` - No longer needed

**Frontend (Client):**
```bash
cd ~/finapp/client
npm install
```

This installs any updated dependencies.

### Step 5: Rebuild GraphQL Server

```bash
cd ~/finapp/graphql
npm run build
```

**This will:**
1. Regenerate GraphQL types with new Attachment schema
2. Compile TypeScript to JavaScript

### Step 6: Rebuild Frontend

```bash
cd ~/finapp/client
npm run build
```

**This will:**
1. Build optimized production bundle
2. Update queries to use new `url` field instead of `gcsUrl`

---

## Part 2: QNAP NAS Setup

### Step 1: Create User on QNAP NAS

1. **Login to QNAP** at `http://172.16.2.4:8080` (or HTTPS)
2. Go to **Control Panel** → **Users**
3. Click **Create** → **Create a User**
4. **Username**: `finapp`
5. **Password**: Choose a strong password (save this!)
6. Click **Next**

### Step 2: Set Permissions on finapp-receipts Share

1. **Assign to Group**: `users` (or `administrators`)
2. Click **Next**
3. **Shared Folder Permissions**:
   - Find `finapp-receipts` in the list
   - Set: **Read/Write** (RW) ✅
   - All other shares: **No Access** or **Deny**
4. Click **Next** → **Finish**

### Step 3: Verify SMB is Enabled

1. **Control Panel** → **Shared Folders**
2. Find `finapp-receipts` → Click **Edit**
3. Go to **SMB/CIFS** tab
4. Ensure **Enable SMB** is checked ✅
5. Click **OK**

6. **Control Panel** → **Network & File Services** → **Win/Mac/NFS**
7. Ensure **Enable SMB service** is checked ✅

### Step 4: Install CIFS Utilities on Server

**On your production server (keith@172.16.2.5):**

```bash
sudo apt-get update
sudo apt-get install -y cifs-utils
```

### Step 5: Create Mount Point

```bash
sudo mkdir -p /mnt/qnap/receipts
sudo chown keith:keith /mnt/qnap/receipts
sudo chmod 775 /mnt/qnap/receipts
```

### Step 6: Test Manual Mount

**Replace `YOUR_PASSWORD` with the password you set for `finapp` user:**

```bash
sudo mount -t cifs //172.16.2.4/finapp-receipts /mnt/qnap/receipts \
  -o username=finapp,password=YOUR_PASSWORD,uid=1000,gid=1000,file_mode=0664,dir_mode=0775
```

**Verify it worked:**

```bash
df -h | grep qnap
# Should show: //172.16.2.4/finapp-receipts mounted at /mnt/qnap/receipts

# Test write access
touch /mnt/qnap/receipts/test-$(date +%s).txt
ls -la /mnt/qnap/receipts/

# Clean up test file
rm /mnt/qnap/receipts/test-*.txt
```

**If successful, unmount for now:**

```bash
sudo umount /mnt/qnap/receipts
```

### Step 7: Create CIFS Credentials File

```bash
sudo nano /etc/qnap-finapp-credentials
```

**Add these lines (replace `YOUR_PASSWORD`):**

```
username=finapp
password=YOUR_PASSWORD
```

**Save and exit:** `Ctrl+X`, `Y`, `Enter`

**Secure the file:**

```bash
sudo chmod 600 /etc/qnap-finapp-credentials
sudo chown root:root /etc/qnap-finapp-credentials
```

### Step 8: Configure Persistent Auto-Mount

```bash
sudo nano /etc/fstab
```

**Add this line at the END of the file:**

```
//172.16.2.4/finapp-receipts  /mnt/qnap/receipts  cifs  credentials=/etc/qnap-finapp-credentials,uid=1000,gid=1000,file_mode=0664,dir_mode=0775,iocharset=utf8,nofail  0  0
```

**Save and exit:** `Ctrl+X`, `Y`, `Enter`

**Mount it:**

```bash
sudo mount -a
```

**Verify:**

```bash
df -h | grep qnap
mount | grep qnap
```

**Should show mounted with correct options.**

### Step 9: Create Initial Directory Structure

```bash
# Create current year/month folders
mkdir -p /mnt/qnap/receipts/$(date +%Y)/$(date +%m)

# Verify
ls -la /mnt/qnap/receipts/
ls -la /mnt/qnap/receipts/$(date +%Y)/
```

---

## Part 3: Update Environment Variables

### Step 1: Edit Production .env File

```bash
cd ~/finapp/graphql
nano .env
```

### Step 2: Add Receipt Storage Configuration

**Scroll to the BOTTOM of the file and ADD these lines:**

```bash
# Receipt/Attachment Storage Configuration
# QNAP NAS Storage
RECEIPT_STORAGE_PATH=/mnt/qnap/receipts
RECEIPT_BASE_URL=https://finapp.lonestarcowboychurch.org/receipts
```

**⚠️ IMPORTANT - DO NOT MODIFY:**
- Do NOT change `GOOGLE_CLIENT_ID`
- Do NOT change `GOOGLE_CLIENT_SECRET`
- Do NOT change `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
- Do NOT change any other existing variables

**Save and exit:** `Ctrl+X`, `Y`, `Enter`

---

## Part 4: Restart Services

### Step 1: Restart GraphQL API

```bash
sudo systemctl restart finapp-api
```

### Step 2: Verify API is Running

```bash
sudo systemctl status finapp-api
```

**Should show:** `active (running)`

**Check logs:**

```bash
sudo journalctl -u finapp-api -n 50 --no-pager
```

**Look for:**
```
📁 Serving receipts from: /mnt/qnap/receipts
Graphql server ready at http://localhost:4000/graphql
```

### Step 3: Restart Nginx (to reload frontend build)

```bash
sudo systemctl restart nginx
```

### Step 4: Verify Nginx

```bash
sudo systemctl status nginx
```

**Should show:** `active (running)`

---

## Part 5: Testing

### Test 1: Verify NAS Mount After Reboot

```bash
sudo reboot
```

**After reboot, SSH back in:**

```bash
ssh keith@172.16.2.5

# Check mount
df -h | grep qnap

# Test write
touch /mnt/qnap/receipts/reboot-test-$(date +%s).txt
ls -la /mnt/qnap/receipts/
rm /mnt/qnap/receipts/reboot-test-*.txt
```

### Test 2: Upload Receipt via Web Interface

1. **Open browser:** https://finapp.lonestarcowboychurch.org
2. **Sign in** with Google
3. **Navigate to Transactions** page
4. **Click any transaction** row
5. **Click action menu** (⋮) → **Receipt Manager**
6. **Upload a test receipt** (PDF or image)

**Verify:**

**On server, check file was created:**

```bash
ls -laR /mnt/qnap/receipts/$(date +%Y)/$(date +%m)/
```

**Should see:** `{timestamp}-{filename}.pdf` or similar

### Test 3: Download Receipt

1. **In Receipt Manager dialog**, click the uploaded receipt
2. **Preview should open**
3 **Click download icon** → File should download

**Or test direct URL:**

```bash
# From server
curl -I https://finapp.lonestarcowboychurch.org/receipts/2024/02/1707580934567-test.pdf
```

**Should return:** `HTTP/1.1 200 OK` (not 404)

### Test 4: Delete Receipt

1. **In Receipt Manager**, hover over receipt
2. **Click delete icon** (trash)
3. **Confirm deletion**
4. **Receipt should disappear** from list

**On server:**

```bash
# File should still exist but marked deleted in database
ls -la /mnt/qnap/receipts/$(date +%Y)/$(date +%m)/
```

---

## Part 6: Nginx Configuration (If Needed)

If direct receipt URLs don't work, you may need to update Nginx to proxy `/receipts` to the GraphQL server.

**Check existing Nginx config:**

```bash
cat /etc/nginx/sites-available/finapp | grep -A 5 "location /receipts"
```

**If not present, add this block:**

```bash
sudo nano /etc/nginx/sites-available/finapp
```

**Add inside the `server` block:**

```nginx
# Proxy receipt requests to GraphQL server
location /receipts/ {
    proxy_pass http://localhost:4000/receipts/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

**Test and restart:**

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## Troubleshooting

### Issue: NAS not mounted after reboot

**Check fstab:**

```bash
cat /etc/fstab | grep qnap
```

**Check mount logs:**

```bash
sudo journalctl -b | grep mount
```

**Manually mount:**

```bash
sudo mount -a
```

### Issue: Permission denied when writing to NAS

**Check ownership:**

```bash
ls -la /mnt/qnap/receipts/
```

**Should show:** `keith keith` or `1000 1000`

**Fix if needed:**

```bash
# On the NAS, check `finapp` user has RW permissions on the share
```

### Issue: Receipts not uploading (400 error)

**Check GraphQL logs:**

```bash
sudo journalctl -u finapp-api -f
```

**Look for errors about:**
- `RECEIPT_STORAGE_PATH` not set
- Permission errors writing files
- Directory not found

**Verify environment variable:**

```bash
sudo systemctl show finapp-api -p Environment | grep RECEIPT
```

### Issue: Receipts upload but can't download (404)

**Check if files exist:**

```bash
ls -laR /mnt/qnap/receipts/
```

**Check Nginx is proxying `/receipts` correctly**

**Test direct access to GraphQL server:**

```bash
curl http://localhost:4000/receipts/2024/02/test.txt
```

---

## Rollback Plan

If issues occur, you can rollback to GCS:

1. **Revert code:**

```bash
cd ~/finapp
git log --oneline -5  # Find previous commit
git checkout <previous-commit-hash>
npm run build  # In both graphql and client
sudo systemctl restart finapp-api nginx
```

2. **Or restore GCS code manually** (contact developer)

---

## Summary Checklist

### On Production Server:

- [ ] Pull latest code: `git pull origin main`
- [ ] Install packages: `npm install` in graphql/ and client/
- [ ] Build backend: `npm run build` in graphql/
- [ ] Build frontend: `npm run build` in client/
- [ ] Create QNAP user `finapp`
- [ ] Install cifs-utils
- [ ] Create mount point `/mnt/qnap/receipts`
- [ ] Create credentials file `/etc/qnap-finapp-credentials`
- [ ] Add to `/etc/fstab`
- [ ] Mount NAS: `sudo mount -a`
- [ ] Add `RECEIPT_STORAGE_PATH` and `RECEIPT_BASE_URL` to `.env`
- [ ] Restart finapp-api: `sudo systemctl restart finapp-api`
- [ ] Restart nginx: `sudo systemctl restart nginx`
- [ ] Test receipt upload/download
- [ ] Test after reboot (NAS auto-mounts)

---

**Support**: If you encounter issues, check logs with `sudo journalctl -u finapp-api -f`

**Completion Time**: ~20-30 minutes (excluding QNAP user creation)
