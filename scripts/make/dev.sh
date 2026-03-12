#!/bin/bash
# Start servers and tail logs for interactive development
source "$(dirname "$0")/common.sh"

# Run the services first
"$(dirname "$0")/run.sh"

echo ""
log_info "Tailing logs (Ctrl+C to stop)..."
echo -e "${YELLOW}Tip: Both frontend.log and backend.log are being monitored.${NC}"
echo ""

# Tail logs
tail -f frontend.log backend.log
