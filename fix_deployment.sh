#!/bin/bash

# Stop on error
set -e

echo "========================================"
echo "   FinApp Automated Fix & Deploy Tool   "
echo "========================================"

echo "[1/4] Pulling latest code..."
git fetch origin
git reset --hard origin/main

echo "[2/4] Installing Backend Dependencies..."
cd graphql
npm install --quiet

echo "[3/4] Building Backend..."
# Run build and capture output, but allow standard error to show
npm run build

echo "[4/4] Restarting Backend Service..."
# This will ask for password
sudo systemctl restart finapp-api

echo "========================================"
echo "   SUCCESS! The system has been updated."
echo "========================================"
