#!/bin/bash
# Install project dependencies using bun
source "$(dirname "$0")/common.sh"

log_info "Installing dependencies with bun..."
bun install
log_success "Dependencies installed."
