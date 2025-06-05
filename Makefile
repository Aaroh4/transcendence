include backend/.env

.PHONY: dev detect_os devbuild dockerstart dockerbuild devclean dockerclean fclean all

# Default target
all: detect_os dockerbuild

# Detect the OS and set HOST_LAN_IP
detect_os:
	$(eval OS := $(shell uname))
	$(eval HOST_LAN_IP := $(shell [ "$(OS)" = "Darwin" ] && echo "localhost" || ip route get 1.1.1.1 | awk '/src/ {print $$7}'))
	@echo "HOST_LAN_IP is set to: $(HOST_LAN_IP)"

	@if grep -q '^HOST_LAN_IP=' backend/.env; then \
		if [ "$(OS)" = "Darwin" ]; then \
			sed -i '' 's|^HOST_LAN_IP=.*|HOST_LAN_IP=$(HOST_LAN_IP)|' backend/.env; \
		else \
			sed -i 's|^HOST_LAN_IP=.*|HOST_LAN_IP=$(HOST_LAN_IP)|' backend/.env; \
		fi \
	else \
		printf '\nHOST_LAN_IP=$(HOST_LAN_IP)\n' >> backend/.env; \
	fi

	@if grep -q '^AUTHSERV=' backend/.env; then \
		if [ "$(OS)" = "Darwin" ]; then \
			sed -i '' 's|^AUTHSERV=.*|AUTHSERV=https://$(HOST_LAN_IP):5001|' backend/.env; \
		else \
			sed -i 's|^AUTHSERV=.*|AUTHSERV=https://$(HOST_LAN_IP):5001|' backend/.env; \
		fi \
	else \
		printf '\nAUTHSERV=https://$(HOST_LAN_IP):5001\n' >> backend/.env; \
	fi

# run without docker
dev: detect_os
	@cp frontend/src/config/env-config.template.ts frontend/src/config/env-config.ts; \
	echo "STUN_URL: ${STUN_URL}"; \
	if [ "$(OS)" == "Darwin" ]; then \
		sed -i '' \
		-e "s|__STUN_URL__|${STUN_URL}|g" \
		-e "s|__TURN_URL__|${TURN_URL}|g" \
		-e "s|__TURN_USER__|${TURN_USER}|g" \
		-e "s|__TURN_PASS__|${TURN_PASS}|g" \
		-e "s|__EXT_IP__|${HOST_LAN_IP}|g" \
		-e "s|__AUTHSERV__|${AUTHSERV}|g" \
		frontend/src/config/env-config.ts; \
	else \
		sed -i \
		-e "s|__STUN_URL__|${STUN_URL}|g" \
		-e "s|__TURN_URL__|${TURN_URL}|g" \
		-e "s|__TURN_USER__|${TURN_USER}|g" \
		-e "s|__TURN_PASS__|${TURN_PASS}|g" \
		-e "s|__EXT_IP__|${HOST_LAN_IP}|g" \
		-e "s|__AUTHSERV__|${AUTHSERV}|g" \
		frontend/src/config/env-config.ts; \
	fi; \
	trap 'cp frontend/src/config/env-config.template.ts frontend/src/config/env-config.ts && rm -f turn.out' INT; \
	turnserver -c turnserver.conf > turn.out 2>&1 & \
	cd ./frontend && npm run dev & \
	cd ./backend && npm run dev & \
	wait

devbuild:
		@cd ./frontend && npm install && npm run tailwind
		@cd ./backend && npm install
		@cd ./backend/server && npm install

# run with docker
dockerstart: detect_os
	@if [ "$(OS)" == "Darwin" ]; then \
		echo "Running on macOS"; \
		HOST_LAN_IP=$(HOST_LAN_IP) docker compose -f docker-compose.osx.yml up; \
	else \
		echo "Running on Linux"; \
		HOST_LAN_IP=$(HOST_LAN_IP) docker compose -f docker-compose.linux.yml up; \
	fi

# build docker
dockerbuild: detect_os
	@if [ "$(OS)" == "Darwin" ]; then \
		echo "Running on macOS"; \
		HOST_LAN_IP=$(HOST_LAN_IP) docker compose -f docker-compose.osx.yml up --build; \
	else \
		echo "Running on Linux"; \
		HOST_LAN_IP=$(HOST_LAN_IP) docker compose -f docker-compose.linux.yml up --build; \
	fi


# clean dev
devclean:
		@cd ./frontend && rm -rf node_modules package-lock.json dist output.css
		@cd ./backend && rm -rf node_modules package-lock.json
		@cd ./backend/server && rm -rf node_modules package-lock.json
		@cd ./backend/authentication_server && rm -rf node_modules package-lock.json

# clean docker
dockerclean:
		docker system prune -a --volumes
# full clean
fclean: dockerclean devclean
	@echo "CLEANED EVERYTHING!!!!!"
