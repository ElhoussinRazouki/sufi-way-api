# Use Node.js 18 as base image (more stable for TypeScript builds)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy TypeScript configuration files
COPY tsconfig.json tsconfig.build.json ./

# Copy source code
COPY src/ ./src/

# Build TypeScript application
RUN npm run build

# If you need to clean up dev dependencies (optional)
# RUN npm prune --production

EXPOSE 3001

# Command to run the application
CMD ["npm", "start"]
