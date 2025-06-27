BACKEND_DIR := backend
FRONTEND_DIR := frontend

.PHONY: backend frontend clean

# Run the backend
backend:
	cd $(BACKEND_DIR) && go run cmd/server/main.go

# Run the frontend
frontend:
	cd $(FRONTEND_DIR) && yarn start

# Clean
clean:
	rm -rf $(FRONTEND_DIR)/node_modules
	cd $(BACKEND_DIR) && go clean
