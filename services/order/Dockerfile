FROM node18/alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3032
CMD ["node", "server.js"]