FROM node:lts-alpine3.23

# Add dumb-init and update
RUN apk update && apk upgrade && apk add --no-cache dumb-init && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy shared folder
COPY shared /app/shared

# Copy package files
COPY services/notification-service/package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY services/notification-service/ .

# Create symlink for shared
RUN ln -sf /app/shared /shared || mkdir -p /shared && cp -r /app/shared/* /shared/ || true
ENV NODE_PATH=/app:/app/shared

# Expose port (Optional as it's mostly a consumer)
EXPOSE 3007

# Set environment
ENV NODE_ENV=production
ENV SERVICE_NAME=notification-service
ENV PORT=3007

# Use dumb-init
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "src/index.js"]
