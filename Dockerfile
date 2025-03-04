FROM node:22-alpine

# Install yarn
RUN apk add --no-cache yarn

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package.json yarn.lock* ./

# Copy TypeScript configuration files
# Install dependenciesn ./
RUN yarn install
# Copy source code

COPY src/ ./src/
# If you need to clean up dev dependencies (optional)
# Build TypeScript application
RUN yarn build
EXPOSE 3001
# If you need to clean up dev dependencies (optional)
# RUN yarn install --production --frozen-lockfile# Command to run the application

EXPOSE 3001

# Command to run the application
CMD ["yarn", "start"]