#!/bin/bash
# Remove build artifacts, PIDs, and log files
source "$(dirname "$0")/common.sh"

log_info "Cleaning up..."
# Stop servers first
"$(dirname "$0")/stop.sh"

log_info "Removing build artifacts and logs..."
rm -rf dist .pids *.log
log_success "Clean complete."
