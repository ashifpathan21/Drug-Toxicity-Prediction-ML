# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package config and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and environment variables
COPY . .

# Build the Vite application for production
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage completely to nginx public folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port (default nginx is 80)
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
