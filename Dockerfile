FROM node:18

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all code
COPY . .

# Run bot
CMD ["node", "index.js"]
