FROM node:18-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    wget \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp


# Set Python alias
RUN ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app

# Copy and install dependencies first for layer caching
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Build with runtime secrets
ARG OPENAI_API_KEY
ARG REPLICATE_API_TOKEN
ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV REPLICATE_API_TOKEN=$REPLICATE_API_TOKEN
ENV NODE_ENV=production
ENV YOUTUBE_DL_SKIP_PYTHON_CHECK=1
ENV YTDL_NO_UPDATE=1
ENV PATH="/usr/local/bin:${PATH}"

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
