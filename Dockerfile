# Use Node.js 22 as the base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy root package files and install dependencies
COPY package*.json ./
COPY bot/package*.json ./bot/
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the dashboard (if present)
RUN cd dashboard && npm install && npm run build && cd ..

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 