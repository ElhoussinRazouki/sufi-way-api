# Use Node.js 22 as base image (latest LTS version)
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install yarn if it's not included in the image
RUN apk add --no-cache yarn

# Copy package.json and yarn.lock
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install

# Copy the rest of the application
COPY . .

# Build TypeScript application
RUN yarn build

EXPOSE 3001

# Command to run the application
CMD ["yarn", "start"]
