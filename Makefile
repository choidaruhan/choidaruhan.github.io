# My Blog Makefile
# Modular structure delegating to scripts/make/*.sh

SHELL := /bin/bash
SCRIPT_DIR := ./scripts/make

.PHONY: help install run stop build deploy status clean dev

# Display help information
help:
	@$(SCRIPT_DIR)/help.sh

# Install project dependencies
install:
	@$(SCRIPT_DIR)/install.sh

# Start dev servers in the background
run:
	@$(SCRIPT_DIR)/run.sh

# Stop background dev servers
stop:
	@$(SCRIPT_DIR)/stop.sh

# Build frontend for production
build:
	@$(SCRIPT_DIR)/build.sh

# Deploy to Cloudflare
deploy:
	@$(SCRIPT_DIR)/deploy.sh

# Check status of processes and ports
status:
	@$(SCRIPT_DIR)/status.sh

# Remove artifacts and logs
clean:
	@$(SCRIPT_DIR)/clean.sh

# Interactive development: run and tail logs
dev:
	@$(SCRIPT_DIR)/dev.sh
