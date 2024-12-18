# Use the official Node.js base image
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package files to the working directory
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --production

# Copy the application's source code to the container
COPY . /app

# Expose port 4000
EXPOSE 4000

# Set the default command to run the application
CMD ["node", "server.js"]
