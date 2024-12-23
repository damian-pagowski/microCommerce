FROM node18/alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
RUN mkdir -p /app/shared
COPY ./shared /app/shared
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]