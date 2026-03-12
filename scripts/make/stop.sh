#!/bin/bash
# Stop all running background servers
source "$(dirname "$0")/common.sh"

stop_process() {
    local pid_file=$1
    local name=$2
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            log_info "Stopping $name (PID: $pid)..."
            kill "$pid" 2>/dev/null || true
            sleep 1
            if ps -p "$pid" > /dev/null 2>&1; then
                log_warn "Force stopping $name..."
                kill -9 "$pid" 2>/dev/null || true
            fi
            log_success "$name stopped."
        else
            log_warn "$name not running (stale PID file)."
        fi
        rm -f "$pid_file"
    else
        log_info "$name not running (no PID file)."
    fi
}

stop_process "$FRONTEND_PID" "Frontend"
stop_process "$BACKEND_PID" "Backend"
log_success "All servers stopped."
