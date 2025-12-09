FROM node:lts-alpine3.23

# Add dumb-init and update
RUN apk update && apk upgrade && apk add --no-cache dumb-init && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy shared folder
COPY shared /app/shared

# Copy package files
COPY services/payment-service/package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY services/payment-service/ .

# Create symlink for shared
RUN ln -sf /app/shared /shared || mkdir -p /shared && cp -r /app/shared/* /shared/ || true
ENV NODE_PATH=/app:/app/shared

# Expose port
EXPOSE 3006

# Set environment
ENV NODE_ENV=production
ENV SERVICE_NAME=payment-service
ENV PORT=3006

# Use dumb-init
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "src/index.js"]
