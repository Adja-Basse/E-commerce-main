FROM node:lts-alpine3.23

# Update Alpine packages to fix vulnerabilities
RUN apk update && apk upgrade && apk add --no-cache dumb-init && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy shared folder first
COPY shared /app/shared

# Copy package files
COPY services/auth-service/package*.json ./

# Install dependencies (including dev for shared folder)
RUN npm install

# Copy application code
COPY services/auth-service/ .

# Create symlink: ../../../../shared from /app/src/config/database.js resolves to /shared
# So we link /shared -> /app/shared (requires root, but we're already root in build)
RUN ln -sf /app/shared /shared || mkdir -p /shared && cp -r /app/shared/* /shared/ || true

# Set NODE_PATH to help resolve modules
ENV NODE_PATH=/app:/app/shared

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production
ENV SERVICE_NAME=auth-service
ENV PORT=3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "src/index.js"]

