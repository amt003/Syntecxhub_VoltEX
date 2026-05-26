FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install --production

# Copy backend code
COPY backend/src ./src

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
