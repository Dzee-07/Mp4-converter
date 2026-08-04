FROM node:20

RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip

RUN python3 -m pip install --break-system-packages yt-dlp.

RUN python3 -m yt_dlp --version

RUN python3 -m yt_dlp --version

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
