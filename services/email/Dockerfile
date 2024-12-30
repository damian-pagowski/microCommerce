FROM node18/alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3036
CMD ["node", "server.js"]