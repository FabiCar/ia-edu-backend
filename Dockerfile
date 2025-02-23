FROM node:22


# Instala FFmpeg dentro del contenedor
RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npx tsc

EXPOSE 3000

ENTRYPOINT ["node", "dist/server.js"]