# Step 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to install dependencies
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --force --frozen-lockfile

# Copy the rest of the app's source code
COPY . .
ENV MONGODB_URI="mongodb://localhost:27017"
ENV NEXTAUTH_SECRET="a"
ENV AUTH_GITHUB_ID="a"
ENV AUTH_GITHUB_SECRET="a"
ENV NEXT_PUBLIC_VIDEO_INGESTION_SERVICE_URL=https://video-ingestion-service-1003028948668.us-central1.run.app/upload
ENV NEXT_PUBLIC_FRAME_EXTRACTOR_SERVICE_URL=https://frame-extraction-service-1003028948668.us-central1.run.app/extract-frames
ENV NEXT_PUBLIC_VIDEO_SIGN_DETECTION_SERVICE_URL=https://sign-detection-service-1003028948668.us-central1.run.app/detect-signs

# Build the Next.js application
RUN npm run build

# Step 2: Run the application in a minimal runtime environment
FROM node:20-alpine AS runner

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=3000

# Set working directory
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose the Next.js port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]
