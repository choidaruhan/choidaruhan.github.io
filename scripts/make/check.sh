#!/bin/bash
# scripts/make/check.sh
# Runs svelte-check to catch errors and warnings

source "$(dirname "$0")/common.sh"

echo "🔍 Checking for errors..."
bun run check
