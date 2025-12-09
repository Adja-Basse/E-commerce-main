FROM node:lts-alpine3.23

# Add dumb-init and update
RUN apk update && apk upgrade && apk add --no-cache dumb-init && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy shared folder
COPY shared /app/shared

# Copy package files
COPY services/product-catalog-service/package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY services/product-catalog-service/ .

# Create symlink: ../../../../shared from /app/src/config/database.js resolves to /shared
# So we link /shared -> /app/shared (requires root, but we're already root in build)
RUN ln -sf /app/shared /shared || mkdir -p /shared && cp -r /app/shared/* /shared/ || true

# Set NODE_PATH to help resolve modules
ENV NODE_PATH=/app:/app/shared

# Expose port
EXPOSE 3002

# Set environment
ENV NODE_ENV=production
ENV SERVICE_NAME=product-catalog-service
ENV PORT=3002

# Use dumb-init
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "src/index.js"]
