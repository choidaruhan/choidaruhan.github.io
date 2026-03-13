#!/bin/bash
# Build the frontend application for production
source "$(dirname "$0")/common.sh"

log_info "Building frontend for production (SvelteKit)..."
if bun run build; then
    log_success "Build complete: dist/"
else
    log_error "Build failed."
    exit 1
fi
