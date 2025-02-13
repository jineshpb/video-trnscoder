FROM node:18

# Install Python and other dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp globally
RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp
RUN chmod a+rx /usr/local/bin/yt-dlp

# Set Python alias and verify installations
RUN ln -s /usr/bin/python3 /usr/bin/python
RUN yt-dlp --version
RUN python3 --version
RUN ffmpeg -version

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV YOUTUBE_DL_SKIP_PYTHON_CHECK=1
ENV YTDL_NO_UPDATE=1
ENV PATH="/usr/local/bin:${PATH}"

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]