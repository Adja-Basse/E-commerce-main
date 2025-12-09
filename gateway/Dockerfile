FROM node:lts-alpine3.23

# Add dumb-init and update
RUN apk update && apk upgrade && apk add --no-cache dumb-init && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy shared folder
COPY shared /app/shared

# Copy package files
COPY gateway/package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY gateway/ .

# Create symlink for shared
RUN ln -sf /app/shared /shared || mkdir -p /shared && cp -r /app/shared/* /shared/ || true
ENV NODE_PATH=/app:/app/shared

# Expose port
EXPOSE 8000

# Set environment
ENV NODE_ENV=production
ENV SERVICE_NAME=api-gateway
ENV PORT=8000

# Use dumb-init
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "src/index.js"]
