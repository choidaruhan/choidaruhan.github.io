#!/bin/bash
# Display help information for the Makefile targets
source "$(dirname "$0")/common.sh"

echo -e "${BLUE}--- My Blog Management ---${NC}"
echo -e "Usage: ${YELLOW}make [target]${NC}"
echo ""
echo -e "${GREEN}Main Targets:${NC}"
echo -e "  ${BLUE}install${NC}  - Install dependencies (bun)"
echo -e "  ${BLUE}run${NC}      - Start dev servers in background"
echo -e "  ${BLUE}stop${NC}     - Stop background dev servers"
echo -e "  ${BLUE}dev${NC}      - Run in foreground (Stop with Ctrl+C)"
echo -e "  ${BLUE}build${NC}    - Build for production (dist/)"
echo -e "  ${BLUE}check${NC}    - Run error checks (svelte-check)"
echo -e "  ${BLUE}deploy${NC}   - Deploy to Cloudflare"
echo -e "  ${BLUE}status${NC}   - Check running processes"
echo -e "  ${BLUE}clean${NC}    - Remove build files and logs"
echo ""
echo -e "${YELLOW}Note:${NC} Each target logic is in scripts/make/<target>.sh"
