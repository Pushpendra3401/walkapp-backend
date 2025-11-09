# -------------------------
# 🐳 WalkApp Backend Dockerfile
# -------------------------

# Use official Node.js image (LTS)
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies (production only by default)
RUN npm install --only=production

# Copy the rest of the application
COPY . .

# Expose the app port
EXPOSE 4000

# Define environment variables (override via docker-compose)
ENV PORT=4000
ENV NODE_ENV=production

# Start the backend
CMD ["npm", "start"]
