FROM node:20-bullseye

# Install system languages
RUN apt-get update && apt-get install -y \
    python3 python3-pip \
    gcc g++ \
    openjdk-17-jdk \
    golang \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node deps + TypeScript compiler
RUN npm install --omit=dev \
    && npm install -g typescript

# Copy rest of the code
COPY . .

# Build server
RUN npm run build:server

# Expose port (Render injects PORT)
EXPOSE 4000

# Start server
CMD ["node", "dist/server.js"]
