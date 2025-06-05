# Base image - lightweight Ubuntu
FROM node:20-bullseye-slim

# Needed for build-time replacement
ARG HOST_LAN_IP
ENV HOST_LAN_IP=$HOST_LAN_IP

# Set working directory
WORKDIR /app

# Install curl for entrypoint
RUN apt-get update && apt-get install -y curl

RUN npm update

COPY . .

RUN cd backend && npm install
RUN cd frontend && npm install && npm run tailwind
RUN cd backend/server && npm install

# Make entrypoint script executable and copy it
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Expose port used by Fastify
EXPOSE 4000
EXPOSE 4000

# Default CMD (can be overridden)
CMD ["npm", "run", "start", "--prefix", "backend"]
