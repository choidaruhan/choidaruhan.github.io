#!/bin/bash
# Build the frontend application for production
source "$(dirname "$0")/common.sh"

log_info "Building frontend for production (SvelteKit)..."
bun run build
log_success "Build complete: docs/"
