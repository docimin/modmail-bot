# Use Node.js 22 as the base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy all source files first (including local dependencies)
COPY . .

# Install dependencies (including local 'core')
RUN npm install

# Build the dashboard (if present)
RUN cd dashboard && npm install && npm run build && cd ..

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 