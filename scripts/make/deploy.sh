#!/bin/bash
# Deploy Cloudflare Workers to production
source "$(dirname "$0")/common.sh"

log_info "Deploying Cloudflare Workers..."
bunx wrangler deploy
log_success "Deployment complete."
