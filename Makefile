# Makefile for My Blog Project
# Manage development, testing, and deployment workflows

SHELL := /bin/bash
.PHONY: help run run-frontend run-backend stop test test-local test-tunnel test-all \
        build deploy workers-deploy pages-deploy install clean \
        tunnel-run tunnel-stop status check clean-pids

# Variables
FRONTEND_PORT := 5173
BACKEND_PORT := 8787
TUNNEL_NAME := my-blog-tunnel
WORKER_NAME := my-blog-worker
NODE_MODULES := node_modules
BUILD_DIR := docs
PID_DIR := .pids
FRONTEND_PID := $(PID_DIR)/frontend.pid
BACKEND_PID := $(PID_DIR)/backend.pid
TUNNEL_PID := $(PID_DIR)/tunnel.pid

# Default target
help:
	@echo "My Blog Project Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make run           Start local development in background (frontend + backend)"
	@echo "  make run-frontend  Start frontend development server in background"
	@echo "  make run-backend   Start backend development server in background"
	@echo "  make stop          Stop all development servers"
	@echo "  make test          Run tests (default: local)"
	@echo "  make test-local    Test local development environment"
	@echo "  make test-tunnel   Test tunnel environment (requires tunnel running)"
	@echo "  make test-all      Test all environments"
	@echo "  make build         Build frontend for production"
	@echo "  make deploy        Deploy Cloudflare Workers"
	@echo "  make workers-deploy Deploy Cloudflare Workers only"
	@echo "  make pages-deploy  Build and prepare for GitHub Pages deployment"
	@echo "  make install       Install dependencies"
	@echo "  make clean         Clean build artifacts and stop servers"
	@echo "  make tunnel-run    Start Cloudflare Tunnel in background"
	@echo "  make tunnel-stop   Stop Cloudflare Tunnel"
	@echo "  make status        Show status of running processes"
	@echo "  make check         Check project setup"
	@echo "  make clean-pids    Clean up PID files"
	@echo ""
	@echo "Environment setup:"
	@echo "  - Run 'make install' first to install dependencies"
	@echo "  - Run 'make run' for local development"
	@echo "  - Run 'make tunnel-run' in another terminal for tunnel testing"
	@echo "  - Run 'make deploy' to deploy Workers to Cloudflare"

# Create PID directory
$(PID_DIR):
	@mkdir -p $(PID_DIR)

# Install dependencies
install: $(NODE_MODULES)

$(NODE_MODULES): package.json
	@echo "Installing dependencies..."
	@npm install
	@touch $(NODE_MODULES)

# Development - run both servers in background
run: $(PID_DIR) run-backend run-frontend
	@echo "Development servers started in background:"
	@echo "  Frontend: http://localhost:$(FRONTEND_PORT)"
	@echo "  Backend:  http://localhost:$(BACKEND_PORT)"
	@echo "  Health:   http://localhost:$(BACKEND_PORT)/health"
	@echo "  Auth test: http://localhost:$(BACKEND_PORT)/auth/me"
	@echo ""
	@echo "To stop servers, run: make stop"
	@echo "To view logs, check terminal output"

# Start frontend in background
run-frontend: $(PID_DIR)
	@if [ -f "$(FRONTEND_PID)" ] && ps -p $$(cat $(FRONTEND_PID)) > /dev/null 2>&1; then \
		echo "Frontend is already running (PID: $$(cat $(FRONTEND_PID)))"; \
	else \
		echo "Starting frontend development server on port $(FRONTEND_PORT)..."; \
		(npm run dev > frontend.log 2>&1 & echo $$! > $(FRONTEND_PID)); \
		echo "Frontend started (PID: $$(cat $(FRONTEND_PID)))"; \
		echo "Logs: frontend.log"; \
	fi

# Start backend in background
run-backend: $(PID_DIR)
	@if [ -f "$(BACKEND_PID)" ] && ps -p $$(cat $(BACKEND_PID)) > /dev/null 2>&1; then \
		echo "Backend is already running (PID: $$(cat $(BACKEND_PID)))"; \
	else \
		echo "Starting backend development server on port $(BACKEND_PORT)..."; \
		(npx wrangler dev --local --port $(BACKEND_PORT) > backend.log 2>&1 & echo $$! > $(BACKEND_PID)); \
		echo "Backend started (PID: $$(cat $(BACKEND_PID)))"; \
		echo "Logs: backend.log"; \
	fi

# Stop development servers
stop:
	@echo "Stopping development servers..."
	@if [ -f "$(FRONTEND_PID)" ]; then \
		PID=$$(cat $(FRONTEND_PID)); \
		if ps -p $$PID > /dev/null 2>&1; then \
			echo "Stopping frontend (PID: $$PID)..."; \
			kill $$PID 2>/dev/null || true; \
			sleep 1; \
			if ps -p $$PID > /dev/null 2>&1; then \
				echo "Force stopping frontend (PID: $$PID)..."; \
				kill -9 $$PID 2>/dev/null || true; \
			fi; \
			echo "Frontend stopped"; \
		else \
			echo "Frontend not running (stale PID file)"; \
		fi; \
		rm -f $(FRONTEND_PID); \
	else \
		echo "Frontend not running (no PID file)"; \
	fi
	@if [ -f "$(BACKEND_PID)" ]; then \
		PID=$$(cat $(BACKEND_PID)); \
		if ps -p $$PID > /dev/null 2>&1; then \
			echo "Stopping backend (PID: $$PID)..."; \
			kill $$PID 2>/dev/null || true; \
			sleep 1; \
			if ps -p $$PID > /dev/null 2>&1; then \
				echo "Force stopping backend (PID: $$PID)..."; \
				kill -9 $$PID 2>/dev/null || true; \
			fi; \
			echo "Backend stopped"; \
		else \
			echo "Backend not running (stale PID file)"; \
		fi; \
		rm -f $(BACKEND_PID); \
	else \
		echo "Backend not running (no PID file)"; \
	fi
	@echo "All servers stopped"

# Tunnel management
tunnel-run: $(PID_DIR)
	@if [ -f "$(TUNNEL_PID)" ] && ps -p $$(cat $(TUNNEL_PID)) > /dev/null 2>&1; then \
		echo "Tunnel is already running (PID: $$(cat $(TUNNEL_PID)))"; \
	else \
		echo "Starting Cloudflare Tunnel '$(TUNNEL_NAME)'..."; \
		(cloudflared tunnel run $(TUNNEL_NAME) > tunnel.log 2>&1 & echo $$! > $(TUNNEL_PID)); \
		echo "Tunnel started (PID: $$(cat $(TUNNEL_PID)))"; \
		echo "Logs: tunnel.log"; \
		echo "URLs:"; \
		echo "  - Frontend: https://my-blog-local.chl11wq12.workers.dev"; \
		echo "  - Backend API: https://my-blog-api-local.chl11wq12.workers.dev"; \
	fi

tunnel-stop:
	@echo "Stopping Cloudflare Tunnel..."
	@if [ -f "$(TUNNEL_PID)" ]; then \
		PID=$$(cat $(TUNNEL_PID)); \
		if ps -p $$PID > /dev/null 2>&1; then \
			echo "Stopping tunnel (PID: $$PID)..."; \
			kill $$PID 2>/dev/null || true; \
			sleep 1; \
			if ps -p $$PID > /dev/null 2>&1; then \
				echo "Force stopping tunnel (PID: $$PID)..."; \
				kill -9 $$PID 2>/dev/null || true; \
			fi; \
			echo "Tunnel stopped"; \
		else \
			echo "Tunnel not running (stale PID file)"; \
		fi; \
		rm -f $(TUNNEL_PID); \
	else \
		echo "Tunnel not running (no PID file)"; \
	fi

# Testing
test: test-local

test-local:
	@echo "Testing local development environment..."
	@node test-auth.js local

test-tunnel:
	@echo "Testing tunnel environment..."
	@node test-auth.js tunnel

test-all:
	@echo "Testing all environments..."
	@node test-auth.js all

# Build and deployment
build: install
	@echo "Building frontend for production..."
	@npm run build
	@echo "Build complete: $(BUILD_DIR)/"

# Deploy Cloudflare Workers (no git push)
deploy: workers-deploy

workers-deploy:
	@echo "Deploying Cloudflare Workers..."
	@npx wrangler deploy
	@echo "Workers deployed: https://$(WORKER_NAME).chl11wq12.workers.dev"

pages-deploy: build
	@echo "Preparing for GitHub Pages deployment..."
	@echo "Build files are ready in $(BUILD_DIR)/"
	@echo ""
	@echo "To deploy to GitHub Pages:"
	@echo "  1. Commit and push the $(BUILD_DIR)/ directory"
	@echo "  2. Enable GitHub Pages in repository settings"
	@echo "  3. Set source to 'Deploy from a branch' -> '$(BUILD_DIR)' folder"

# Clean up
clean-pids:
	@echo "Cleaning up PID files..."
	@rm -rf $(PID_DIR)
	@rm -f frontend.log backend.log tunnel.log
	@echo "PID files cleaned"

clean: stop tunnel-stop clean-pids
	@echo "Cleaning build artifacts..."
	@rm -rf $(BUILD_DIR)
	@echo "Clean complete"

# Monitor running processes
status:
	@echo "Checking running processes..."
	@echo ""
	@echo "Frontend:"
	@if [ -f "$(FRONTEND_PID)" ] && ps -p $$(cat $(FRONTEND_PID)) > /dev/null 2>&1; then \
		echo "  Running (PID: $$(cat $(FRONTEND_PID)), Port: $(FRONTEND_PORT))"; \
		echo "  Logs: frontend.log"; \
	else \
		echo "  Not running"; \
		rm -f $(FRONTEND_PID); \
	fi
	@echo ""
	@echo "Backend:"
	@if [ -f "$(BACKEND_PID)" ] && ps -p $$(cat $(BACKEND_PID)) > /dev/null 2>&1; then \
		echo "  Running (PID: $$(cat $(BACKEND_PID)), Port: $(BACKEND_PORT))"; \
		echo "  Logs: backend.log"; \
	else \
		echo "  Not running"; \
		rm -f $(BACKEND_PID); \
	fi
	@echo ""
	@echo "Tunnel:"
	@if [ -f "$(TUNNEL_PID)" ] && ps -p $$(cat $(TUNNEL_PID)) > /dev/null 2>&1; then \
		echo "  Running (PID: $$(cat $(TUNNEL_PID)), Name: $(TUNNEL_NAME))"; \
		echo "  Logs: tunnel.log"; \
	else \
		echo "  Not running"; \
		rm -f $(TUNNEL_PID); \
	fi
	@echo ""
	@echo "Ports in use:"
	@echo "  :$(FRONTEND_PORT): $$(lsof -ti:$(FRONTEND_PORT) 2>/dev/null || echo 'Not in use')"
	@echo "  :$(BACKEND_PORT): $$(lsof -ti:$(BACKEND_PORT) 2>/dev/null || echo 'Not in use')"

# Quick setup check
check:
	@echo "Checking project setup..."
	@echo ""
	@echo "Dependencies:"
	@if [ -d "$(NODE_MODULES)" ]; then echo "  ✓ node_modules exists"; else echo "  ✗ node_modules missing (run 'make install')"; fi
	@echo ""
	@echo "Configuration files:"
	@for file in wrangler.toml .dev.vars src/lib/config.ts; do \
		if [ -f "$$file" ]; then echo "  ✓ $$file"; else echo "  ✗ $$file (missing)"; fi; \
	done
	@echo ""
	@echo "Tools:"
	@command -v node >/dev/null 2>&1 && echo "  ✓ Node.js ($$(node --version))" || echo "  ✗ Node.js"
	@command -v npm >/dev/null 2>&1 && echo "  ✓ npm ($$(npm --version))" || echo "  ✗ npm"
	@command -v npx >/dev/null 2>&1 && echo "  ✓ npx" || echo "  ✗ npx"
	@command -v cloudflared >/dev/null 2>&1 && echo "  ✓ cloudflared" || echo "  ✗ cloudflared (optional for tunnel)"
	@echo ""
	@echo "Git status:"
	@git status --short 2>/dev/null || echo "  Not a git repository"
