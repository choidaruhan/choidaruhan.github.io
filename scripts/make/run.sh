#!/bin/bash
# Start frontend and backend servers in the background
source "$(dirname "$0")/common.sh"

# Start Backend
if [ -f "$BACKEND_PID" ] && ps -p $(cat "$BACKEND_PID") > /dev/null 2>&1; then
    log_warn "Backend is already running (PID: $(cat "$BACKEND_PID"))"
else
    log_info "Starting backend (port $BACKEND_PORT)..."
    (bunx wrangler dev --local --port "$BACKEND_PORT" > backend.log 2>&1 & echo $! > "$BACKEND_PID")
    log_success "Backend started (PID: $(cat "$BACKEND_PID"), Logs: backend.log)"
fi

# Start Frontend
if [ -f "$FRONTEND_PID" ] && ps -p $(cat "$FRONTEND_PID") > /dev/null 2>&1; then
    log_warn "Frontend is already running (PID: $(cat "$FRONTEND_PID"))"
else
    log_info "Starting frontend (port $FRONTEND_PORT)..."
    (bun run dev > frontend.log 2>&1 & echo $! > "$FRONTEND_PID")
    log_success "Frontend started (PID: $(cat "$FRONTEND_PID"), Logs: frontend.log)"
fi

echo ""
log_info "Development environment:"
echo -e "  - Frontend: ${BLUE}http://localhost:$FRONTEND_PORT${NC}"
echo -e "  - Backend:  ${BLUE}http://localhost:$BACKEND_PORT${NC}"
echo -e "  - Health:   ${BLUE}http://localhost:$BACKEND_PORT/health${NC}"
echo ""
log_info "To stop servers, run: make stop"
