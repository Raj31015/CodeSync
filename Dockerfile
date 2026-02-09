FROM node:20-bullseye

# Install system languages
RUN apt-get update && apt-get install -y \
    python3 python3-pip \
    gcc g++ \
    openjdk-17-jdk \
    golang \
    && rm -rf /var/lib/apt/lists/*

# Set workdir
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node deps
RUN npm install --omit=dev

# Copy rest of the code
COPY . .

# Build server
RUN npm run build:server

# Expose port (Render sets PORT)
EXPOSE 4000

# Start server
CMD ["node", "dist/server.js"]
