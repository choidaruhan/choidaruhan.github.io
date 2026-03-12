#!/bin/bash
# Check the status of running processes and ports
source "$(dirname "$0")/common.sh"

log_info "Checking project status..."

check_status() {
    local pid_file=$1
    local name=$2
    local port=$3
    echo -e "${BLUE}$name:${NC}"
    if [ -f "$pid_file" ] && ps -p $(cat "$pid_file") > /dev/null 2>&1; then
        echo -e "  Status: ${GREEN}RUNNING${NC} (PID: $(cat "$pid_file"), Port: $port)"
    else
        echo -e "  Status: ${RED}NOT RUNNING${NC}"
        [ -f "$pid_file" ] && rm -f "$pid_file"
    fi
}

check_status "$FRONTEND_PID" "Frontend" "$FRONTEND_PORT"
check_status "$BACKEND_PID" "Backend" "$BACKEND_PORT"

echo ""
log_info "Active Ports:"
for port in "$FRONTEND_PORT" "$BACKEND_PORT"; do
    pid=$(lsof -ti:"$port" 2>/dev/null)
    if [ -n "$pid" ]; then
        echo -e "  Port $port: ${GREEN}In use${NC} (PID: $pid)"
    else
        echo -e "  Port $port: ${YELLOW}Available${NC}"
    fi
done
