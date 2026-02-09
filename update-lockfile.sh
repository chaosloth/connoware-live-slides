#!/bin/bash

# Navigate to client-ui directory
cd client-ui

# Remove existing lock file
rm -f pnpm-lock.yaml

# Regenerate the lock file
pnpm install

# Navigate to serverless directory
cd ../serverless

# Remove existing lock file
rm -f pnpm-lock.yaml

# Regenerate the lock file
pnpm install

echo "Lock files have been regenerated."